'use client';
import {forwardRef,type ComponentPropsWithoutRef} from 'react';

// Native same-frame navigation works in both embedded Sites and standalone tabs.
// Leave authentication handoffs on their dedicated, supported auth anchors.
const SiteLink=forwardRef<HTMLAnchorElement,ComponentPropsWithoutRef<'a'>>(function SiteLink(props,ref){
 return <a {...props} ref={ref} target="_self"/>;
});
export default SiteLink;
