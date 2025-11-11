import AdminLayout from '@/components/admin/AdminLayout';
import TestimonialManager from '@/components/admin/TestimonialManager';

const AdminTestimonials = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials & Case Studies</h1>
          <p className="text-slate-300">Manage testimonials and case studies that appear on the landing page.</p>
        </div>
        <TestimonialManager />
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;