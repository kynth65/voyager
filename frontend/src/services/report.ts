import apiClient from '../lib/axios';
import type {
  BookingExportParams,
  RevenueReportParams,
  PopularRoutesReportParams,
  RevenueReport,
  PopularRoutesReport,
} from '../types/report';

export const reportService = {
  /**
   * Export bookings to CSV
   * Downloads a CSV file with filtered booking data
   */
  async exportBookingsCSV(params?: BookingExportParams): Promise<Blob> {
    const response = await apiClient.get('/reports/bookings/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate revenue report
   * Get detailed revenue analytics for a date range
   */
  async generateRevenueReport(params?: RevenueReportParams): Promise<RevenueReport> {
    const response = await apiClient.get<RevenueReport>('/reports/revenue', { params });
    return response.data;
  },

  /**
   * Generate popular routes report
   * Get statistics and ranking of most popular routes
   */
  async generatePopularRoutesReport(params?: PopularRoutesReportParams): Promise<PopularRoutesReport> {
    const response = await apiClient.get<PopularRoutesReport>('/reports/routes/popular', { params });
    return response.data;
  },

  /**
   * Helper: Download blob as file
   * Triggers browser download for CSV exports
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
