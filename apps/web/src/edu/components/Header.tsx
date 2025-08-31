"use client";

import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenuRoot, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export function Header() {
  return (
    <header role="banner" className="border-b border-border bg-card/50 sticky top-0 z-40">
      <div className="flex h-12 items-center gap-4 px-4">
        <h1 className="text-base font-semibold">EduPlatform</h1>
        <nav aria-label="Primary" data-testid="primary-nav" className="flex items-center gap-3 text-sm">
          <Link href="/edu/assignments" data-testid="nav-assignments">Assignments</Link>
          <Link href="/edu/courses" data-testid="nav-courses">Courses</Link>
          <Link href="/edu/lessons" data-testid="nav-lessons">Lessons</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <input
            type="search"
            placeholder="Search"
            className={cn('border rounded px-3 py-1 text-sm')}
            aria-label="Search"
          />
          <DropdownMenuRoot>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button aria-label="Actions" variant="secondary" size="sm">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>New Course</DropdownMenuItem>
                <DropdownMenuItem>New Assignment</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DropdownMenuRoot>
          <Breadcrumbs />
          <Button aria-label="Notifications" variant="ghost" size="sm" className="relative">
            <span>Notifications</span>
            <Badge className="absolute -top-2 -right-2">3</Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}


