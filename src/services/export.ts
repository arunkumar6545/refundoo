import type { Refund } from '../types';
import { format } from 'date-fns';

export function exportToCSV(refunds: Refund[]): void {
  if (refunds.length === 0) {
    return;
  }

  const headers = [
    'ID',
    'Order ID',
    'Customer Name',
    'Phone',
    'Email',
    'Amount',
    'Currency',
    'Reason',
    'Status',
    'Tags',
    'Created At',
    'Updated At',
    'Notes',
  ];

  const rows = refunds.map(refund => [
    refund.id,
    refund.orderId,
    refund.customerName,
    refund.contactPhone,
    refund.email,
    refund.amount.toString(),
    refund.currency,
    refund.reason,
    refund.status,
    refund.tags.join('; '),
    format(new Date(refund.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    format(new Date(refund.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
    refund.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `refunds_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function exportToJSON(refunds: Refund[]): void {
  const jsonContent = JSON.stringify(refunds, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `refunds_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
