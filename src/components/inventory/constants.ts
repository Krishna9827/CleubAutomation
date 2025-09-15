

export const categories = [
  'Lights', 'Fans', 'HVAC', 'Smart Devices',
  'Curtain & Blinds', 'Security', 'Touch Panels',
  'Retrofit Relays', 'Panel Finishes', 'Other'
];

// For touch panel configuration UI
export const touchPanelTypes = ['Glass', 'Acrylic', 'Plastic'];
export const touchPanelModules = [2, 4, 6, 8, 12];
export const touchPanelChannelOptions = [
  { value: 'Light', label: 'Light' },
  { value: 'Fan', label: 'Fan' },
  { value: 'TV', label: 'TV' },
  { value: 'AC', label: 'AC' },
  { value: 'Curtain', label: 'Curtain' },
  { value: 'Other', label: 'Other' },
];

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Lights': return 'bg-yellow-100 text-yellow-800';
    case 'Fans': return 'bg-blue-100 text-blue-800';
    case 'HVAC': return 'bg-red-100 text-red-800';
    case 'Smart Devices': return 'bg-purple-100 text-purple-800';
    case 'Curtain & Blinds': return 'bg-green-100 text-green-800';
    case 'Security': return 'bg-orange-100 text-orange-800';
    case 'Touch Panels': return 'bg-cyan-100 text-cyan-800';
    case 'Retrofit Relays': return 'bg-indigo-100 text-indigo-800';
    case 'Panel Finishes': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const defaultPrices = [
  { id: '1', category: 'Lights', subcategory: 'Basic ON/OFF', wattage: 6, pricePerUnit: 150, notes: 'Actuator based' },
  { id: '2', category: 'Lights', subcategory: 'Tunable', wattage: 9, pricePerUnit: 250, notes: 'Dali based' },
  { id: '3', category: 'Lights', subcategory: 'RGB', wattage: 12, pricePerUnit: 350, notes: 'Dali based' },
  { id: '4', category: 'Lights', subcategory: 'RGBW', wattage: 15, pricePerUnit: 450, notes: 'Dali based' },
  { id: '5', category: 'Fans', pricePerUnit: 2000, notes: 'Ceiling fan' },
  { id: '6', category: 'HVAC', pricePerUnit: 35000, notes: 'Standard AC unit' },
  { id: '7', category: 'Curtain & Blinds', subcategory: 'Track', pricePerUnit: 2500, notes: 'Curtain track' },
  { id: '8', category: 'Curtain & Blinds', subcategory: 'Motor', pricePerUnit: 7000, notes: 'Smart Wi-Fi motor' },
  { id: '9', category: 'Smart Devices', pricePerUnit: 1500, notes: 'Smart switch/sensor' },
  { id: '10', category: 'Security', pricePerUnit: 3000, notes: 'Security device' },
  { id: '11', category: 'Touch Panels', subcategory: '2 Channel', pricePerUnit: 4500, notes: 'Touch panel 2Ch' },
  { id: '12', category: 'Touch Panels', subcategory: '4 Channel', pricePerUnit: 6500, notes: 'Touch panel 4Ch' },
  { id: '13', category: 'Touch Panels', subcategory: '6 Channel', pricePerUnit: 8500, notes: 'Touch panel 6Ch' },
  { id: '14', category: 'Touch Panels', subcategory: '8 Channel', pricePerUnit: 11500, notes: 'Touch panel 8Ch' },
  { id: '15', category: 'Touch Panels', subcategory: '12 Channel', pricePerUnit: 15500, notes: 'Touch panel 12Ch' },
  { id: '16', category: 'Touch Panels', subcategory: 'Tactile Panel', pricePerUnit: 3500, notes: 'Physical buttons' },
  { id: '17', category: 'Touch Panels', subcategory: 'Touch Screen', pricePerUnit: 12000, notes: 'LCD touch screen' },
  { id: '18', category: 'Touch Panels', subcategory: 'Dialer Knob', pricePerUnit: 2500, notes: 'Rotary dimmer' },
  { id: '19', category: 'Touch Panels', subcategory: 'IR Blaster', pricePerUnit: 1800, notes: 'Infrared controller' },
  { id: '20', category: 'Retrofit Relays', subcategory: '1 Channel 10A', pricePerUnit: 1200, notes: '1Ch 10Amp relay' },
  { id: '21', category: 'Retrofit Relays', subcategory: '2 Channel 10A', pricePerUnit: 2200, notes: '2Ch 10Amp relay' },
  { id: '22', category: 'Retrofit Relays', subcategory: '4 Channel 10A', pricePerUnit: 4200, notes: '4Ch 10Amp relay' },
  { id: '23', category: 'Retrofit Relays', subcategory: '1 Channel 16A', pricePerUnit: 1800, notes: '1Ch 16Amp relay' },
  { id: '24', category: 'Retrofit Relays', subcategory: '2 Channel 16A', pricePerUnit: 3200, notes: '2Ch 16Amp relay' },
  { id: '25', category: 'Retrofit Relays', subcategory: '1 Channel 40A', pricePerUnit: 3500, notes: '1Ch 40Amp relay' },
  { id: '26', category: 'Retrofit Relays', subcategory: 'Dimmer Module', pricePerUnit: 2800, notes: 'For dimmable lights' },
  { id: '27', category: 'Panel Finishes', subcategory: 'Glass', pricePerUnit: 800, notes: 'Glass finish panel' },
  { id: '28', category: 'Panel Finishes', subcategory: 'Acrylic', pricePerUnit: 500, notes: 'Acrylic finish panel' },
  { id: '29', category: 'Panel Finishes', subcategory: 'Plastic', pricePerUnit: 300, notes: 'Plastic finish panel' }
];
