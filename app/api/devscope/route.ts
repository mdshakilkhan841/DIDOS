import { NextResponse } from 'next/server';
import * as devscope from '@/lib/dudos/devscope/client';
import { mapStatus, customerLabel, milestones, isTerminal } from '@/lib/dudos/devscope/status-mapper';
import type { DevscopeSubmission } from '@/lib/dudos/devscope/types';

/**
 * Server-to-server internal API route for DevScope AI Builder.
 * Ensures DevScope credentials and base URL are never exposed to the client browser.
 */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const view = url.searchParams.get('view');
    const requestId = crypto.randomUUID();

    // 1. Health Probe
    if (view === 'health') {
      const state = await devscope.health(requestId);
      return NextResponse.json({ ...state, ...devscope.configSummary() });
    }

    // 2. Build Status Poller
    const buildId = url.searchParams.get('build_id');
    const externalProjectId = url.searchParams.get('project_id') || 'proj_default';

    if (!buildId) {
      return NextResponse.json(
        { error: 'Missing required build_id query parameter.' },
        { status: 400 }
      );
    }

    const rawStatus = await devscope.buildStatus(buildId, externalProjectId, requestId);
    const status = mapStatus(rawStatus.raw_status || rawStatus.status);

    return NextResponse.json({
      success: true,
      build_id: rawStatus.build_id,
      devscope_project_id: rawStatus.devscope_project_id,
      status,
      status_label: customerLabel(status),
      stage: rawStatus.stage,
      raw_status: rawStatus.raw_status,
      preview_url: rawStatus.preview_url || null,
      production_url: rawStatus.production_url || null,
      repository_url: rawStatus.repository_url || null,
      error_summary: rawStatus.error_summary || null,
      milestones: milestones(status),
      terminal: isTerminal(status),
    });
  } catch (error: any) {
    console.error('DevScope GET bridge error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch DevScope information.', code: error?.code || 'devscope_error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = crypto.randomUUID();

    const {
      project_id,
      name,
      requirements = '',
      srs = '',
      pages = [],
      features = [],
      integrations = [],
      tech_stack = 'Next.js + FastAPI',
      database = 'PostgreSQL',
      platform = 'web',
      idempotency_key,
    } = body;

    if (!name || !project_id) {
      return NextResponse.json(
        { error: 'Missing required project name or project_id.' },
        { status: 400 }
      );
    }

    const idempotencyKey = idempotency_key || `idemp_${project_id}_${name.toLowerCase().replace(/\s+/g, '-')}`;

    const submission: DevscopeSubmission = {
      source: 'dudos',
      external_project_id: project_id,
      external_project_url: `/app?project=${encodeURIComponent(project_id)}`,
      external_revision: 1,
      idempotency_key: idempotencyKey,
      project: {
        name,
        type: 'custom_software',
        business_objective: `Automated build and delivery for ${name}`,
        target_users: 'Enterprise & Customer Users',
        requirements: String(requirements || srs || name),
        srs: srs ? String(srs) : undefined,
        pages: Array.isArray(pages) ? pages : ['Home', 'Dashboard'],
        features: Array.isArray(features) ? features : ['Core Application Module'],
        integrations: Array.isArray(integrations) ? integrations : [],
      },
      design_context: {
        style: 'modern_teal',
        layout: 'enterprise',
      },
      technology_preferences: {
        backend: tech_stack.includes('FastAPI') ? 'FastAPI' : 'Next.js API',
        database: database || 'PostgreSQL',
        platform: platform || 'web',
      },
      execution: {
        workflow: 'aidlc',
        tier: 'auto',
      },
    };

    const result = await devscope.submitProject(submission, requestId);
    const mappedStatus = mapStatus(result.raw_status || result.status);

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        customer_status: mappedStatus,
        status_label: customerLabel(mappedStatus),
        milestones: milestones(mappedStatus),
      },
    });
  } catch (error: any) {
    console.error('DevScope POST bridge error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit build to DevScope.', code: error?.code || 'devscope_error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const requestId = crypto.randomUUID();

    const { build_id, decision, comment } = body;

    if (!build_id || !decision) {
      return NextResponse.json(
        { error: 'Missing required build_id or decision.' },
        { status: 400 }
      );
    }

    const result = await devscope.submitApproval(
      build_id,
      { decision, comment, actor_reference: 'dudos_customer' },
      requestId
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('DevScope PATCH bridge error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update build approval.', code: error?.code || 'devscope_error' },
      { status: 500 }
    );
  }
}
