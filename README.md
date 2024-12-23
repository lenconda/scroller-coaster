# Scroller Coaster

A customizable, flexible, and elegant scrollbar component for React.js and Next.js.

[Live Demo](https://unpkg.com/scroller-coaster/demo/index.html)

## Features

- 🎯 Support for both vertical and horizontal scrolling
- 🌐 RTL layout support
- 🎨 Fully customizable styling
- 🔄 Smooth scrolling experience
- ⚡ High performance, no jank
- 📱 Responsive design

## Installation

```bash
npm install scroller-coaster
```

## Basic Usage

```tsx
import { ScrollerCoaster } from 'scroller-coaster';

const App = () => {
  return (
    <ScrollerCoaster
      style={{
        width: '400px',
        height: '300px',
        border: '1px solid #ccc'
      }}
    >
      {/* Your content */}
    </ScrollerCoaster>
  );
};
```

## API

### ScrollerCoaster Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| draggingScrollMaximumSpeed | number | 15 | Maximum speed of scroll when dragging (px/frame) |
| draggingScrollThreshold | number | 50 | Threshold to trigger drag scrolling (px) |
| horizontalTrackProps | ScrollerCoasterTrackProps | - | Horizontal scrollbar track properties |
| verticalTrackProps | ScrollerCoasterTrackProps | - | Vertical scrollbar track properties |
| dir | 'rtl' \| 'ltr' | 'ltr' | Text direction |

### ScrollerCoasterTrackProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| showMode | 'always' \| 'hover' \| 'scrolling' | 'scrolling' | Scrollbar visibility mode |
| size | number | 12 | Scrollbar size (px) |
| thumbProps | React.HTMLAttributes<HTMLDivElement> | - | Scrollbar thumb properties |

## Examples

### Custom Scrollbar Styling

```tsx
<ScrollerCoaster
  horizontalTrackProps={{
    showMode: 'always',
    size: 8,
    thumbProps: {
      style: {
        backgroundColor: '#6366f1',
        borderRadius: '4px'
      }
    }
  }}
  verticalTrackProps={{
    showMode: 'hover',
    size: 8,
    thumbProps: {
      style: {
        backgroundColor: '#6366f1',
        borderRadius: '4px'
      }
    }
  }}
>
  {/* Content */}
</ScrollerCoaster>
```

### RTL Support

```tsx
<ScrollerCoaster
  dir="rtl"
  style={{
    width: '400px',
    height: '300px'
  }}
>
  {/* RTL content */}
</ScrollerCoaster>
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

```bash
# Install dependencies
npm install

# Run development environment
npm run demo

# Build library
npm run build:lib

# Build demo
npm run build:demo
```

## License

MIT

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
