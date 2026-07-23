'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, Footer } from '@/components/wise';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Eye,
  Check,
  X,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  consultantId: string;
  consultantName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Consultant {
  id: string;
  name: string;
  color: string;
}

interface ViewMode {
  type: 'calendar' | 'list';
}

const CONSULTANT_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ef4444', // red
  '#6366f1', // indigo
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  'no-show': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [consultants, setConsultants] = useState<Map<string, Consultant>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode['type']>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // List view filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConsultant, setFilterConsultant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings || []);

      // Extract unique consultants and assign colors
      const consultantMap = new Map<string, Consultant>();
      (data.bookings || []).forEach((booking: Booking, idx: number) => {
        if (!consultantMap.has(booking.consultantId)) {
          consultantMap.set(booking.consultantId, {
            id: booking.consultantId,
            name: booking.consultantName,
            color: CONSULTANT_COLORS[idx % CONSULTANT_COLORS.length],
          });
        }
      });
      setConsultants(consultantMap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings for list view
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.consultantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConsultant = !filterConsultant || booking.consultantId === filterConsultant;
    const matchesStatus = !filterStatus || booking.status === filterStatus;
    const bookingDate = new Date(booking.date);
    const startDate = new Date(filterDateRange.start);
    const endDate = new Date(filterDateRange.end);
    endDate.setHours(23, 59, 59, 999);
    const matchesDateRange = bookingDate >= startDate && bookingDate <= endDate;

    return matchesSearch && matchesConsultant && matchesStatus && matchesDateRange;
  });

  // Paginate filtered bookings
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIdx, startIdx + itemsPerPage);

  // Get bookings for calendar month
  const getMonthBookings = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
    });
  };

  // Get bookings for a specific day
  const getDateBookings = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter((booking) => booking.date === dateStr);
  };

  // Calculate revenue report
  const getRevenueReport = () => {
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.price, 0);
    const byConsultant: Record<string, number> = {};

    completedBookings.forEach((booking) => {
      byConsultant[booking.consultantName] =
        (byConsultant[booking.consultantName] || 0) + booking.price;
    });

    return {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
      completedBookings: completedBookings.length,
      totalRevenue,
      byConsultant,
      averagePrice: completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0,
    };
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Email', 'Consultant', 'Service', 'Date', 'Time', 'Status', 'Price'];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.userName,
      b.userEmail,
      b.consultantName,
      b.serviceName,
      b.date,
      b.time,
      b.status,
      b.price,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update booking');
      await fetchBookings();
      setSelectedBooking(null);
      setShowDetailModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  const report = getRevenueReport();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <div className="text-gray-400">Loading bookings...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <h1 className="text-4xl font-bold">Booking Management</h1>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#161616] hover:bg-[#1a1a1a]'
                }`}
              >
                <Calendar size={18} />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#161616] hover:bg-[#1a1a1a]'
                }`}
              >
                <Search size={18} />
                List
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-[#161616] hover:bg-[#1a1a1a] rounded-lg font-semibold transition flex items-center gap-2"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Revenue Report Cards */}
          <div className="mb-12 grid md:grid-cols-5 gap-4">
            <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={18} className="text-emerald-400" />
                <div className="text-gray-400 text-sm">Total Bookings</div>
              </div>
              <div className="text-3xl font-bold">{report.totalBookings}</div>
            </div>
            <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Check size={18} className="text-blue-400" />
                <div className="text-gray-400 text-sm">Confirmed</div>
              </div>
              <div className="text-3xl font-bold text-blue-400">{report.confirmedBookings}</div>
            </div>
            <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Check size={18} className="text-emerald-400" />
                <div className="text-gray-400 text-sm">Completed</div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{report.completedBookings}</div>
            </div>
            <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={18} className="text-amber-400" />
                <div className="text-gray-400 text-sm">Total Revenue</div>
              </div>
              <div className="text-3xl font-bold text-amber-400">
                ${report.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-violet-400" />
                <div className="text-gray-400 text-sm">Avg. Price</div>
              </div>
              <div className="text-3xl font-bold text-violet-400">
                ${report.averagePrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <CalendarView
              bookings={getMonthBookings()}
              consultants={consultants}
              selectedMonth={selectedMonth}
              onPrevMonth={() =>
                setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))
              }
              onNextMonth={() =>
                setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))
              }
              onSelectBooking={(booking) => {
                setSelectedBooking(booking);
                setShowDetailModal(true);
              }}
              getDateBookings={getDateBookings}
            />
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <>
              {/* Filters */}
              <div className="mb-8 grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="User, email, consultant..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Consultant
                  </label>
                  <select
                    value={filterConsultant}
                    onChange={(e) => {
                      setFilterConsultant(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">All Consultants</option>
                    {Array.from(consultants.values()).map((consultant) => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="no-show">No Show</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">From Date</label>
                  <input
                    type="date"
                    value={filterDateRange.start}
                    onChange={(e) => {
                      setFilterDateRange((prev) => ({ ...prev, start: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                {paginatedBookings.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No bookings found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                          <th className="text-left py-4 px-6 font-semibold text-gray-400">
                            User
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-400">
                            Consultant
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-400">
                            Service
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-400">
                            Date & Time
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-400">
                            Status
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-400">Price</th>
                          <th className="text-right py-4 px-6 font-semibold text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.map((booking, idx) => (
                          <tr
                            key={booking.id}
                            className={`border-b border-[#0f0f0f] hover:bg-[#0a0a0a] transition cursor-pointer ${
                              idx % 2 === 0 ? 'bg-[#050505]' : 'bg-[#101010]'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="font-semibold">{booking.userName}</div>
                              <div className="text-xs text-gray-500">{booking.userEmail}</div>
                            </td>
                            <td className="py-4 px-6 font-semibold">{booking.consultantName}</td>
                            <td className="py-4 px-6 text-gray-400">{booking.serviceName}</td>
                            <td className="py-4 px-6 text-gray-400">
                              <div>{booking.date}</div>
                              <div className="text-xs">{booking.time}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  STATUS_COLORS[booking.status]?.bg || 'bg-gray-500/20'
                                } ${STATUS_COLORS[booking.status]?.text || 'text-gray-400'}`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-semibold">${booking.price}</td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowDetailModal(true);
                                }}
                                className="px-3 py-1 text-sm bg-[#161616] hover:bg-[#1a1a1a] rounded transition flex items-center gap-2 ml-auto"
                              >
                                <Eye size={16} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 p-6 border-t border-[#1a1a1a]">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition ${
                          currentPage === page
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#161616] hover:bg-[#1a1a1a]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Revenue by Consultant */}
          {Object.keys(report.byConsultant).length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Revenue by Consultant</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(report.byConsultant).map(([consultant, revenue]) => (
                  <div
                    key={consultant}
                    className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Users size={18} className="text-emerald-400" />
                      <h4 className="font-semibold">{consultant}</h4>
                    </div>
                    <div className="text-3xl font-bold text-amber-400">
                      ${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      {bookings
                        .filter((b) => b.consultantName === consultant && b.status === 'completed')
                        .length}{' '}
                      completed bookings
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
          onStatusChange={updateBookingStatus}
          submitting={submitting}
          consultant={consultants.get(selectedBooking.consultantId)}
        />
      )}

      <Footer />
    </div>
  );
}

// Calendar View Component
interface CalendarViewProps {
  bookings: Booking[];
  consultants: Map<string, Consultant>;
  selectedMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectBooking: (booking: Booking) => void;
  getDateBookings: (date: Date) => Booking[];
}

function CalendarView({
  consultants,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onSelectBooking,
  getDateBookings,
}: CalendarViewProps) {
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">{monthName}</h2>
        <div className="flex gap-3">
          <button
            onClick={onPrevMonth}
            className="p-2 bg-[#161616] hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 bg-[#161616] hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dateBookings = day ? getDateBookings(day) : [];
          const isToday =
            day &&
            day.toDateString() === new Date().toDateString();

          return (
            <div
              key={idx}
              className={`min-h-24 p-2 rounded-lg border ${
                day
                  ? isToday
                    ? 'border-emerald-500/50 bg-[#0a0a0a]'
                    : 'border-[#1a1a1a] bg-[#0f0f0f] hover:border-emerald-500/30 transition cursor-pointer'
                  : 'border-transparent'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-semibold mb-1 text-gray-400">{day.getDate()}</div>
                  <div className="space-y-1">
                    {dateBookings.slice(0, 2).map((booking) => {
                      const consultant = consultants.get(booking.consultantId);
                      return (
                        <div
                          key={booking.id}
                          onClick={() => onSelectBooking(booking)}
                          className="text-xs px-2 py-1 rounded truncate hover:opacity-80 transition"
                          style={{
                            backgroundColor: consultant?.color + '30',
                            color: consultant?.color,
                            borderLeft: `3px solid ${consultant?.color}`,
                          }}
                          title={`${booking.consultantName} - ${booking.time}`}
                        >
                          {booking.time}
                        </div>
                      );
                    })}
                    {dateBookings.length > 2 && (
                      <div className="text-xs px-2 py-1 rounded text-gray-400">
                        +{dateBookings.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Booking Detail Modal Component
interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (bookingId: string, status: Booking['status']) => Promise<void>;
  submitting: boolean;
  consultant?: Consultant;
}

function BookingDetailModal({
  booking,
  onClose,
  onStatusChange,
  submitting,
  consultant,
}: BookingDetailModalProps) {
  const [notes, setNotes] = useState(booking.notes || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Booking Details</h3>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_COLORS[booking.status]?.bg || 'bg-gray-500/20'
                } ${STATUS_COLORS[booking.status]?.text || 'text-gray-400'}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              {consultant && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: consultant.color }}
                />
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Booking Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* User Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Client Information</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-semibold">{booking.userName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-semibold text-blue-400">{booking.userEmail}</div>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Booking Information</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Service</div>
                <div className="font-semibold">{booking.serviceName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Price</div>
                <div className="font-semibold text-amber-400">${booking.price}</div>
              </div>
            </div>
          </div>

          {/* Consultant Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Consultant</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-semibold">{booking.consultantName}</div>
              </div>
            </div>
          </div>

          {/* Schedule Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Schedule</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-semibold">{booking.date}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="font-semibold">
                  {booking.time} ({booking.duration} minutes)
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Timezone</div>
                <div className="font-semibold">{booking.timezone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-400 mb-3">
            Consultant Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            placeholder="Internal notes about this booking..."
          />
        </div>

        {/* Metadata */}
        <div className="mb-8 p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
          <div className="text-xs text-gray-500 mb-2">Booking ID: {booking.id}</div>
          <div className="text-xs text-gray-500">
            Created: {new Date(booking.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Status Actions */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Update Status</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onStatusChange(booking.id, 'confirmed')}
              disabled={submitting || booking.status === 'confirmed'}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition disabled:opacity-50"
            >
              Mark Confirmed
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'completed')}
              disabled={submitting || booking.status === 'completed'}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition disabled:opacity-50"
            >
              Mark Completed
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'no-show')}
              disabled={submitting || booking.status === 'no-show'}
              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition disabled:opacity-50"
            >
              Mark No Show
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'cancelled')}
              disabled={submitting || booking.status === 'cancelled'}
              className="px-4 py-2 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
