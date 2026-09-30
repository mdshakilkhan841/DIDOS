"use client";

import * as React from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
    id: string;
    header: React.ReactNode;
    cell: (row: T) => React.ReactNode;
    /** Plain-text value for CSV export; the column is skipped when omitted. */
    exportValue?: (row: T) => string | number | null | undefined;
    /** Include in CSV export only, not in the on-screen table. */
    exportOnly?: boolean;
    className?: string;
    headerClassName?: string;
};

type DataTableProps<T> = {
    rows: T[];
    columns: DataTableColumn<T>[];
    getRowId: (row: T) => string;
    /** Change it (e.g. filter + search text) to jump back to page 1 and clear selection. */
    resetKey?: string;
    onRowClick?: (row: T) => void;
    selectable?: boolean;
    /** Extra actions for the selected rows, shown in the selection bar. */
    bulkActions?: (selected: T[], clearSelection: () => void) => React.ReactNode;
    exportFileName?: string;
    pageSizeOptions?: number[];
    initialPageSize?: number;
    loading?: boolean;
    error?: string;
    empty?: React.ReactNode;
    /** Accessible name for the table and its checkboxes. */
    label: string;
};

const csvCell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function downloadCsv<T>(fileName: string, columns: DataTableColumn<T>[], rows: T[]) {
    const exportable = columns.filter((column) => column.exportValue);
    const lines = [
        exportable
            .map((column) => csvCell(typeof column.header === "string" ? column.header : column.id))
            .join(","),
        ...rows.map((row) =>
            exportable.map((column) => csvCell(column.exportValue?.(row))).join(","),
        ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
}

// Compact page list: 1 … 4 5 6 … 20
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const sorted = [...new Set([1, pageCount, page - 1, page, page + 1])]
        .filter((p) => p >= 1 && p <= pageCount)
        .sort((a, b) => a - b);
    const result: (number | "gap")[] = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
        result.push(p);
    });
    return result;
}

/**
 * Shared table pattern: row numbers, checkbox selection with bulk actions and
 * CSV export, and pagination so only one page of rows is rendered.
 */
export function DataTable<T>({
    rows,
    columns,
    getRowId,
    resetKey = "",
    onRowClick,
    selectable = true,
    bulkActions,
    exportFileName = "export",
    pageSizeOptions = [10, 25, 50, 100],
    initialPageSize = 10,
    loading = false,
    error,
    empty,
    label,
}: DataTableProps<T>) {
    const [pageSize, setPageSize] = React.useState(initialPageSize);
    const [view, setView] = React.useState(() => ({
        key: resetKey,
        page: 1,
        selected: new Set<string>(),
    }));

    // Filters changed: back to page 1 with nothing selected. Adjusting state
    // during render (not in an effect) avoids a flash of the old page.
    if (view.key !== resetKey) {
        setView({ key: resetKey, page: 1, selected: new Set() });
    }

    const total = rows.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(view.page, pageCount);
    const start = (page - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    const rowIds = React.useMemo(() => new Set(rows.map(getRowId)), [rows, getRowId]);
    // Rows can disappear after a refresh; only count ids still present.
    const selected = new Set([...view.selected].filter((id) => rowIds.has(id)));
    const selectedRows = rows.filter((row) => selected.has(getRowId(row)));
    const pageIds = pageRows.map(getRowId);
    const pageSelectedCount = pageIds.filter((id) => selected.has(id)).length;
    const allPageSelected = pageRows.length > 0 && pageSelectedCount === pageRows.length;

    const setSelected = (next: Set<string>) => setView((prev) => ({ ...prev, selected: next }));
    const setPage = (next: number) =>
        setView((prev) => ({ ...prev, page: Math.min(Math.max(1, next), pageCount) }));
    const clearSelection = () => setSelected(new Set());

    const toggleRow = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };
    const togglePage = () => {
        const next = new Set(selected);
        if (allPageSelected) pageIds.forEach((id) => next.delete(id));
        else pageIds.forEach((id) => next.add(id));
        setSelected(next);
    };

    const visibleColumns = columns.filter((column) => !column.exportOnly);
    const columnCount = visibleColumns.length + 1 + (selectable ? 1 : 0);
    const canExport = columns.some((column) => column.exportValue);
    const message = error || (loading && total === 0 ? "Loading…" : total === 0 ? empty || "No records." : null);

    return (
        <div className="overflow-hidden rounded-xl border border-dudos-border bg-white">
            {selectable && selected.size > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-b border-dudos-border bg-[#edf7f4] px-4 py-2 text-xs">
                    <strong className="text-dudos-text">{selected.size} selected</strong>
                    {allPageSelected && selected.size < total && (
                        <button
                            type="button"
                            onClick={() => setSelected(new Set(rowIds))}
                            className="cursor-pointer font-medium text-dudos-primary hover:underline"
                        >
                            Select all {total}
                        </button>
                    )}
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                        {bulkActions?.(selectedRows, clearSelection)}
                        {canExport && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 bg-white text-xs"
                                onClick={() => downloadCsv(exportFileName, columns, selectedRows)}
                            >
                                <Download className="mr-1 h-3.5 w-3.5" />
                                Export CSV
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={clearSelection}
                            aria-label="Clear selection"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            <Table aria-label={label}>
                <TableHeader>
                    <TableRow className="bg-[#f8fafb] hover:bg-[#f8fafb]">
                        {selectable && (
                            <TableHead className="w-10">
                                <Checkbox
                                    aria-label={`Select all ${label} on this page`}
                                    checked={
                                        allPageSelected
                                            ? true
                                            : pageSelectedCount > 0
                                              ? "indeterminate"
                                              : false
                                    }
                                    onCheckedChange={togglePage}
                                    disabled={pageRows.length === 0 || Boolean(message)}
                                />
                            </TableHead>
                        )}
                        <TableHead className="w-12 text-dudos-text-secondary">#</TableHead>
                        {visibleColumns.map((column) => (
                            <TableHead key={column.id} className={column.headerClassName}>
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {message ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell
                                colSpan={columnCount}
                                className={cn(
                                    "py-12 text-center text-sm",
                                    error ? "text-rose-700" : "text-dudos-text-secondary",
                                )}
                            >
                                {message}
                            </TableCell>
                        </TableRow>
                    ) : (
                        pageRows.map((row, index) => {
                            const id = getRowId(row);
                            const isSelected = selected.has(id);
                            return (
                                <TableRow
                                    key={id}
                                    data-state={isSelected ? "selected" : undefined}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    className={cn(onRowClick && "cursor-pointer")}
                                >
                                    {selectable && (
                                        <TableCell onClick={(event) => event.stopPropagation()}>
                                            <Checkbox
                                                aria-label={`Select row ${start + index + 1}`}
                                                checked={isSelected}
                                                onCheckedChange={() => toggleRow(id)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="text-xs tabular-nums text-dudos-text-secondary">
                                        {start + index + 1}
                                    </TableCell>
                                    {visibleColumns.map((column) => (
                                        <TableCell key={column.id} className={column.className}>
                                            {column.cell(row)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {!message && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dudos-border px-4 py-2.5 text-xs text-dudos-text-secondary">
                    <div className="flex flex-wrap items-center gap-3">
                        <span>
                            Showing <strong className="text-dudos-text">{start + 1}</strong>–
                            <strong className="text-dudos-text">{Math.min(start + pageSize, total)}</strong> of{" "}
                            <strong className="text-dudos-text">{total}</strong>
                        </span>
                        <label className="flex items-center gap-1.5">
                            Rows per page
                            <select
                                value={pageSize}
                                onChange={(event) => {
                                    setPageSize(Number(event.target.value));
                                    setView((prev) => ({ ...prev, page: 1 }));
                                }}
                                className="h-7 rounded-md border border-dudos-border bg-white px-1.5 text-xs text-dudos-text"
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {pageCount > 1 && (
                        <nav className="flex items-center gap-1" aria-label={`${label} pages`}>
                            <PagerButton label="First page" disabled={page === 1} onClick={() => setPage(1)}>
                                <ChevronsLeft className="h-3.5 w-3.5" />
                            </PagerButton>
                            <PagerButton label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </PagerButton>
                            {pageWindow(page, pageCount).map((item, i) =>
                                item === "gap" ? (
                                    <span key={`gap-${i}`} className="px-1">
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setPage(item)}
                                        aria-current={item === page ? "page" : undefined}
                                        className={cn(
                                            "h-7 min-w-7 cursor-pointer rounded-md px-2 tabular-nums",
                                            item === page
                                                ? "bg-dudos-primary font-semibold text-white"
                                                : "hover:bg-slate-100",
                                        )}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}
                            <PagerButton label="Next page" disabled={page === pageCount} onClick={() => setPage(page + 1)}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </PagerButton>
                            <PagerButton label="Last page" disabled={page === pageCount} onClick={() => setPage(pageCount)}>
                                <ChevronsRight className="h-3.5 w-3.5" />
                            </PagerButton>
                        </nav>
                    )}
                </div>
            )}
        </div>
    );
}

function PagerButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {children}
        </button>
    );
}
