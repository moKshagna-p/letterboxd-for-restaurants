export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: string;
  location: string;
  rating: number;
  reviews: Review[];
  menu: MenuItem[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

export const restaurants: Restaurant[] = [
  {
    id: 'barbecue-nation',
    name: 'Barbeque Nation',
    description: 'Famous for its varied buffet spread and live grill at the table experience. One of Chennai\'s most popular dining destinations for groups and families.',
    image: '🍗',
    cuisine: 'Continental, North Indian, BBQ',
    location: 'Mount Road • 2.5 km',
    rating: 4.5,
    reviews: [
      {
        id: '1',
        userName: 'Rahul Kumar',
        rating: 5,
        comment: 'Amazing food quality and excellent service! The live grill concept is unique and the desserts are to die for. Highly recommended!',
        date: '2024-01-15',
      },
      {
        id: '2',
        userName: 'Priya Menon',
        rating: 4,
        comment: 'Great buffet spread with good variety. The grilled items were perfect. A bit pricey but worth it for special occasions.',
        date: '2024-01-10',
      },
      {
        id: '3',
        userName: 'Arjun Reddy',
        rating: 4.5,
        comment: 'Love the concept of live grilling. Food is fresh and delicious. Service could be faster during peak hours.',
        date: '2024-01-05',
      },
    ],
    menu: [
      {
        id: 'm1',
        name: 'Chicken Seekh Kebab',
        description: 'Tender minced chicken kebabs with aromatic spices',
        price: '₹450',
        category: 'Starters',
      },
      {
        id: 'm2',
        name: 'Prawn Fry',
        description: 'Crispy prawns marinated in secret spices',
        price: '₹520',
        category: 'Starters',
      },
      {
        id: 'm3',
        name: 'Barbeque Chicken Wings',
        description: 'Spicy grilled chicken wings with BBQ sauce',
        price: '₹380',
        category: 'Starters',
      },
      {
        id: 'm4',
        name: 'Mutton Biryani',
        description: 'Fragrant basmati rice cooked with tender mutton',
        price: '₹650',
        category: 'Main Course',
      },
      {
        id: 'm5',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken',
        price: '₹480',
        category: 'Main Course',
      },
      {
        id: 'm6',
        name: 'Chocolate Brownie with Ice Cream',
        description: 'Warm brownie served with vanilla ice cream',
        price: '₹220',
        category: 'Desserts',
      },
    ],
  },
  {
    id: 'paris-eiffel',
    name: 'Paris Eiffel Tower Restaurant',
    description: 'Elegant French cuisine with Indian touches. Known for its sophisticated ambiance and authentic European dishes with a local twist.',
    image: '🥖',
    cuisine: 'French, Continental',
    location: 'Anna Nagar • 5 km',
    rating: 4.6,
    reviews: [
      {
        id: 'r1',
        userName: 'Meera Iyer',
        rating: 5,
        comment: 'Sophisticated dining experience! The French onion soup was authentic and the desserts were heavenly. Perfect for a romantic dinner.',
        date: '2024-01-12',
      },
      {
        id: 'r2',
        userName: 'Vikram Chandran',
        rating: 4.5,
        comment: 'Excellent food and beautiful presentation. The staff is knowledgeable and helpful. Pricey but the quality justifies it.',
        date: '2024-01-08',
      },
      {
        id: 'r3',
        userName: 'Anjana Rao',
        rating: 4,
        comment: 'Loved the European ambiance. Food quality is top-notch. Make sure to book in advance as it gets crowded.',
        date: '2024-01-03',
      },
    ],
    menu: [
      {
        id: 'mf1',
        name: 'French Onion Soup',
        description: 'Classic soup with caramelized onions and gruyere cheese',
        price: '₹350',
        category: 'Soups',
      },
      {
        id: 'mf2',
        name: 'Escargot de Bourgogne',
        description: 'Snails cooked in garlic butter and herbs',
        price: '₹550',
        category: 'Starters',
      },
      {
        id: 'mf3',
        name: 'Coq au Vin',
        description: 'Chicken braised in red wine with vegetables',
        price: '₹680',
        category: 'Main Course',
      },
      {
        id: 'mf4',
        name: 'Beef Bourguignon',
        description: 'French beef stew cooked in red wine',
        price: '₹750',
        category: 'Main Course',
      },
      {
        id: 'mf5',
        name: 'Crème Brûlée',
        description: 'Classic French custard with caramelized sugar',
        price: '₹320',
        category: 'Desserts',
      },
      {
        id: 'mf6',
        name: 'Tarte Tatin',
        description: 'Upside-down apple tart with vanilla ice cream',
        price: '₹380',
        category: 'Desserts',
      },
    ],
  },
  {
    id: 'pind-balluchi',
    name: 'Pind Balluchi',
    description: 'Authentic North Indian cuisine with traditional recipes. Famous for tandoori specialties and rich gravies in a rustic Punjabi setting.',
    image: '🍛',
    cuisine: 'North Indian, Punjabi',
    location: 'T Nagar • 3 km',
    rating: 4.4,
    reviews: [
      {
        id: 'pb1',
        userName: 'Harish Patel',
        rating: 4.5,
        comment: 'Authentic Punjabi flavors! The dal makhani and butter naan combination is unbeatable. Portions are generous.',
        date: '2024-01-14',
      },
      {
        id: 'pb2',
        userName: 'Deepika Sharma',
        rating: 4,
        comment: 'Great food quality and service. The restaurant has a nice traditional ambiance. Must try the tandoori items!',
        date: '2024-01-09',
      },
      {
        id: 'pb3',
        userName: 'Manish Gupta',
        rating: 4.5,
        comment: 'One of the best places for North Indian food in Chennai. Everything tastes authentic. Will definitely come back!',
        date: '2024-01-06',
      },
    ],
    menu: [
      {
        id: 'mp1',
        name: 'Dal Makhani',
        description: 'Creamy black lentils cooked overnight with butter',
        price: '₹420',
        category: 'Main Course',
      },
      {
        id: 'mp2',
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in rich tomato gravy',
        price: '₹450',
        category: 'Main Course',
      },
      {
        id: 'mp3',
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato butter sauce',
        price: '₹480',
        category: 'Main Course',
      },
      {
        id: 'mp4',
        name: 'Tandoori Roti',
        description: 'Traditional clay oven baked bread',
        price: '₹35',
        category: 'Breads',
      },
      {
        id: 'mp5',
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken',
        price: '₹550',
        category: 'Main Course',
      },
      {
        id: 'mp6',
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in sugar syrup',
        price: '₹180',
        category: 'Desserts',
      },
    ],
  },
  {
    id: 'ent-koffie',
    name: 'ENT Koffie',
    description: 'Cozy café known for South Indian breakfast and filter coffee. A heritage brand serving authentic Tamilian dishes with modern twists.',
    image: '☕',
    cuisine: 'South Indian, Café',
    location: 'Egmore • 1.8 km',
    rating: 4.7,
    reviews: [
      {
        id: 'ek1',
        userName: 'Shankar Raman',
        rating: 5,
        comment: 'Best filter coffee in Chennai! The traditional South Indian breakfast is authentic and delicious. A must-visit for food lovers.',
        date: '2024-01-13',
      },
      {
        id: 'ek2',
        userName: 'Lakshmi Venkatesh',
        rating: 4.5,
        comment: 'Heritage café with amazing coffee. The dosa varieties are excellent. Very reasonable prices for the quality.',
        date: '2024-01-07',
      },
      {
        id: 'ek3',
        userName: 'Ramesh Nathan',
        rating: 4.5,
        comment: 'Traditional South Indian breakfast done right. The idli and chutney are perfect. Great place to start your day!',
        date: '2024-01-04',
      },
    ],
    menu: [
      {
        id: 'me1',
        name: 'Masala Dosa',
        description: 'Crispy crepe with spiced potato filling',
        price: '₹95',
        category: 'Breakfast',
      },
      {
        id: 'me2',
        name: 'Filter Coffee',
        description: 'Traditional South Indian coffee decoction',
        price: '₹45',
        category: 'Beverages',
      },
      {
        id: 'me3',
        name: 'Idli Sambar',
        description: 'Steamed rice cakes with lentil stew',
        price: '₹85',
        category: 'Breakfast',
      },
      {
        id: 'me4',
        name: 'Pongal',
        description: 'Rice and lentil porridge with ghee',
        price: '₹90',
        category: 'Breakfast',
      },
      {
        id: 'me5',
        name: 'Vada Sambar',
        description: 'Fried lentil donuts with spicy curry',
        price: '₹80',
        category: 'Breakfast',
      },
      {
        id: 'me6',
        name: 'Rava Kesari',
        description: 'Sweet semolina pudding with nuts',
        price: '₹65',
        category: 'Desserts',
      },
    ],
  },
];

