export const compactStyle = {
  components: {
    Group: {
      defaultProps: {
        gap: 'xs'
      }
    },
    Stack: {
      defaultProps: {
        gap: 'xs'
      }
    },
    Button: {
      defaultProps: {
        size: 'sm'
      }
    },
    Text: {
      defaultProps: {
        size: 'sm'
      }
    },
    MenuItem: {
      styles: {
        root: {
          padding: '4px 8px'
        }
      }
    }
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  radius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px'
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
  }
}; 