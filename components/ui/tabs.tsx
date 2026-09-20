'use client';
import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
export const Tabs=TabsPrimitive.Root;
export function TabsList({className='',...props}:React.ComponentProps<typeof TabsPrimitive.List>){return <TabsPrimitive.List className={'tabs-list '+className} {...props}/>}
export function TabsTrigger({className='',...props}:React.ComponentProps<typeof TabsPrimitive.Trigger>){return <TabsPrimitive.Trigger className={'tabs-trigger '+className} {...props}/>}
