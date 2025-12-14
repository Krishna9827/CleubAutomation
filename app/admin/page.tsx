'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Building2, Package, Users } from 'lucide-react';
import { projectService } from '@/supabase/projectService';
import { adminService } from '@/supabase/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    pendingInquiries: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [projects, inquiries] = await Promise.all([
          projectService.getAllProjects(),
          adminService.getAllInquiries(),
        ]);

        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter((p: any) => p.status === 'in-progress').length,
          totalInquiries: inquiries.length,
          pendingInquiries: inquiries.filter((i: any) => i.status === 'pending').length,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const dashboardCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: Building2,
      href: '/admin/projects',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Building2,
      href: '/admin/projects',
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
    },
    {
      title: 'Pending Inquiries',
      value: stats.pendingInquiries,
      icon: MessageSquare,
      href: '/admin/inquiries',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      href: '/admin/inquiries',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Overview of your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="bg-black/40 border-white/10 hover:border-white/20 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  {loading ? (
                    <div className="animate-pulse h-8 w-16 bg-slate-700 rounded"></div>
                  ) : (
                    <span className="text-3xl font-bold text-white">{card.value}</span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{card.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/inquiries"
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-slate-300">View Inquiries</span>
              {stats.pendingInquiries > 0 && (
                <Badge className="bg-yellow-500">{stats.pendingInquiries} pending</Badge>
              )}
            </Link>
            <Link
              href="/admin/projects"
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-slate-300">Manage Projects</span>
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                {stats.totalProjects} total
              </Badge>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-slate-300">Manage Inventory</span>
              <Package className="w-4 h-4 text-slate-400" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-slate-300">Database</span>
              <Badge className="bg-green-500">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-slate-300">Authentication</span>
              <Badge className="bg-green-500">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-slate-300">Real-time Updates</span>
              <Badge className="bg-green-500">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
