'use client';
import {createContext,useContext} from 'react';
import baseline from '@/lib/dudos/public-content.json';
import {initialContent} from '@/lib/dudos/cms-model';
export const ContentContext=createContext<any>(initialContent);
export type PublicContent=typeof baseline & {home:any;news:any[];case_studies:any[];job_openings:any[];opportunities:any[];marketplace_listings:any[];service_status:any[]};
export const useContent=():PublicContent=>useContext(ContentContext);
