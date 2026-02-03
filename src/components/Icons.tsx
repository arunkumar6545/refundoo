import React from 'react';

// Icon component exports - using react-icons
// Icon wrapper to ensure consistent sizing and styling across all icons
const IconWrapper = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span 
    className={`inline-flex items-center justify-center ${className}`} 
    style={{ 
      fontSize: '1em', 
      lineHeight: 1, 
      width: '1em', 
      height: '1em',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {children}
  </span>
);

// All icons use consistent sizing for uniform appearance
export const Icons = {
  Home: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🏠</span></IconWrapper>,
  Add: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>➕</span></IconWrapper>,
  History: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>⏰</span></IconWrapper>,
  Reports: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📄</span></IconWrapper>,
  Profile: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>👤</span></IconWrapper>,
  Settings: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>⚙️</span></IconWrapper>,
  Email: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📧</span></IconWrapper>,
  SMS: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>💬</span></IconWrapper>,
  Refresh: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🔄</span></IconWrapper>,
  Check: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>✅</span></IconWrapper>,
  X: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>❌</span></IconWrapper>,
  Alert: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>⚠️</span></IconWrapper>,
  Search: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🔍</span></IconWrapper>,
  Download: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📥</span></IconWrapper>,
  Upload: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📤</span></IconWrapper>,
  Sun: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>☀️</span></IconWrapper>,
  Moon: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🌙</span></IconWrapper>,
  Calendar: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📅</span></IconWrapper>,
  Package: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📦</span></IconWrapper>,
  CheckCircle: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>✅</span></IconWrapper>,
  Dollar: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>💰</span></IconWrapper>,
  TrendingUp: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📈</span></IconWrapper>,
  Bell: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🔔</span></IconWrapper>,
  BellOff: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🔕</span></IconWrapper>,
  Shield: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🛡️</span></IconWrapper>,
  Lock: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🔒</span></IconWrapper>,
  Unlock: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🔓</span></IconWrapper>,
  Wifi: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📶</span></IconWrapper>,
  WifiOff: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📵</span></IconWrapper>,
  ShoppingCart: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>🛒</span></IconWrapper>,
  User: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>👤</span></IconWrapper>,
  Group: (props?: any) => <IconWrapper className={props?.className}><span style={{ fontSize: '1em', lineHeight: 1 }}>📊</span></IconWrapper>,
};
