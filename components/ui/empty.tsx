import * as React from 'react';
export function Empty({className='',...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={className} {...props}/>}
export function EmptyHeader({className='',...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={'empty-header '+className} {...props}/>}
export function EmptyTitle({className='',...props}:React.HTMLAttributes<HTMLHeadingElement>){return <h3 className={className} data-slot="empty-title" {...props}/>}
export function EmptyDescription({className='',...props}:React.HTMLAttributes<HTMLParagraphElement>){return <p className={className} data-slot="empty-description" {...props}/>}
export function EmptyMedia({className='',...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={'empty-media '+className} data-slot="empty-media" {...props}/>}
