import { v4 as uuidv4 } from 'uuid';
import type { Refund } from '../types';
import { saveRefunds } from './storage';

// Company icon mapping
export const companyIcons: Record<string, string> = {
  'Amazon': '🛒',
  'Apple': '🍎',
  'Microsoft': '🪟',
  'Google': '🔍',
  'Meta': '📘',
  'Netflix': '🎬',
  'Spotify': '🎵',
  'Uber': '🚗',
  'Airbnb': '🏠',
  'Tesla': '⚡',
  'Starbucks': '☕',
  'Nike': '👟',
  'Adidas': '👕',
  'Samsung': '📱',
  'Sony': '🎮',
  'Disney': '🏰',
  'McDonald\'s': '🍔',
  'Coca-Cola': '🥤',
  'Pepsi': '🥤',
  'FedEx': '📦',
  'UPS': '🚚',
  'DHL': '📮',
  'Walmart': '🛍️',
  'Target': '🎯',
  'Best Buy': '💻',
  'Home Depot': '🔨',
  'Lowe\'s': '🔧',
  'Costco': '📦',
  'Whole Foods': '🥬',
  'Trader Joe\'s': '🛒',
};

export function getCompanyIcon(companyName: string): string {
  // Try exact match first
  if (companyIcons[companyName]) {
    return companyIcons[companyName];
  }
  
  // Try partial match
  for (const [company, icon] of Object.entries(companyIcons)) {
    if (companyName.toLowerCase().includes(company.toLowerCase()) || 
        company.toLowerCase().includes(companyName.toLowerCase())) {
      return icon;
    }
  }
  
  // Default: return first letter
  return companyName.charAt(0).toUpperCase();
}

const companies = [
  { name: 'Amazon', email: 'customer@amazon.com', phone: '+1-555-0101' },
  { name: 'Apple', email: 'support@apple.com', phone: '+1-555-0102' },
  { name: 'Microsoft', email: 'help@microsoft.com', phone: '+1-555-0103' },
  { name: 'Google', email: 'support@google.com', phone: '+1-555-0104' },
  { name: 'Netflix', email: 'help@netflix.com', phone: '+1-555-0105' },
  { name: 'Spotify', email: 'support@spotify.com', phone: '+1-555-0106' },
  { name: 'Uber', email: 'help@uber.com', phone: '+1-555-0107' },
  { name: 'Airbnb', email: 'support@airbnb.com', phone: '+1-555-0108' },
  { name: 'Tesla', email: 'service@tesla.com', phone: '+1-555-0109' },
  { name: 'Starbucks', email: 'customer@starbucks.com', phone: '+1-555-0110' },
  { name: 'Nike', email: 'support@nike.com', phone: '+1-555-0111' },
  { name: 'Samsung', email: 'help@samsung.com', phone: '+1-555-0112' },
  { name: 'Disney', email: 'guest.services@disney.com', phone: '+1-555-0113' },
  { name: 'Walmart', email: 'help@walmart.com', phone: '+1-555-0114' },
  { name: 'Target', email: 'guest.services@target.com', phone: '+1-555-0115' },
];

const reasons = [
  'Product defect',
  'Wrong item received',
  'Item not as described',
  'Late delivery',
  'Damaged during shipping',
  'Size/color mismatch',
  'Changed mind',
  'Duplicate order',
  'Cancellation request',
  'Service not provided',
  'Quality issues',
  'Missing items',
];

const statuses: Array<'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'> = ['PENDING', 'APPROVED', 'REJECTED', 'PAID'];

export function generateSeedData(): Refund[] {
  const refunds: Refund[] = [];
  const now = new Date();
  
  for (let i = 0; i < 25; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    const updatedAt = new Date(createdAt);
    const statusChangeDays = Math.floor(Math.random() * daysAgo);
    updatedAt.setDate(updatedAt.getDate() + statusChangeDays);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.floor(Math.random() * 5000) + 100; // $100 to $5100
    const currency = ['USD', 'INR', 'EUR'][Math.floor(Math.random() * 3)];
    
    refunds.push({
      id: uuidv4(),
      orderId: `ORD-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
      customerName: company.name,
      contactPhone: company.phone,
      email: company.email,
      amount: amount,
      currency: currency,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: status,
      tags: [
        ['electronics', 'premium'][Math.floor(Math.random() * 2)],
        ['urgent', 'standard'][Math.floor(Math.random() * 2)],
      ].filter(Boolean),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      notes: Math.random() > 0.7 ? `Customer requested expedited processing. Order was placed on ${createdAt.toLocaleDateString()}.` : undefined,
    });
  }
  
  return refunds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function seedRefunds(): void {
  const existingRefunds = JSON.parse(localStorage.getItem('refunds_v1') || '[]');
  if (existingRefunds.length > 0) {
    if (!window.confirm('This will add sample data to your existing refunds. Continue?')) {
      return;
    }
  }
  
  const seedData = generateSeedData();
  const allRefunds = [...existingRefunds, ...seedData];
  saveRefunds(allRefunds);
  window.location.reload();
}
