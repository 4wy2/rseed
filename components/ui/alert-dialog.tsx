'use client';
import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
export const AlertDialog=AlertDialogPrimitive.Root;
export function AlertDialogContent({className='',children,...props}:React.ComponentProps<typeof AlertDialogPrimitive.Content>){return <AlertDialogPrimitive.Portal><AlertDialogPrimitive.Overlay className="dialog-overlay"/><AlertDialogPrimitive.Content className={className} {...props}>{children}</AlertDialogPrimitive.Content></AlertDialogPrimitive.Portal>}
export function AlertDialogHeader({className='',...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={className} {...props}/>}
export function AlertDialogFooter({className='',...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={'alert-footer '+className} {...props}/>}
export const AlertDialogTitle=AlertDialogPrimitive.Title;
export const AlertDialogDescription=AlertDialogPrimitive.Description;
export const AlertDialogCancel=AlertDialogPrimitive.Cancel;
export const AlertDialogAction=AlertDialogPrimitive.Action;
