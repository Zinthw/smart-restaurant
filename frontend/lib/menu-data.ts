export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  reviews: number
  modifiers?: Modifier[]
  isAvailable: boolean
}

export interface Modifier {
  id: string
  name: string
  options: ModifierOption[]
  required: boolean
  multiple: boolean
}

export interface ModifierOption {
  id: string
  name: string
  price: number
}

export interface Category {
  id: string
  name: string
  icon: string
}

export const categories: Category[] = [
  { id: "all", name: "Tất cả", icon: "🍽️" },
  { id: "appetizers", name: "Khai vị", icon: "🥗" },
  { id: "main", name: "Món chính", icon: "🍖" },
  { id: "seafood", name: "Hải sản", icon: "🦐" },
  { id: "noodles", name: "Mì & Phở", icon: "🍜" },
  { id: "rice", name: "Cơm", icon: "🍚" },
  { id: "drinks", name: "Đồ uống", icon: "🥤" },
  { id: "desserts", name: "Tráng miệng", icon: "🍰" },
]

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Gỏi cuốn tôm thịt",
    description: "Bánh tráng cuốn tôm, thịt heo, bún, rau thơm, chấm nước mắm chua ngọt",
    price: 65000,
    image: "/fresh-spring-rolls-with-shrimp.jpg",
    category: "appetizers",
    rating: 4.8,
    reviews: 124,
    isAvailable: true,
    modifiers: [
      {
        id: "m1",
        name: "Số lượng",
        options: [
          { id: "o1", name: "2 cuốn", price: 0 },
          { id: "o2", name: "4 cuốn", price: 55000 },
        ],
        required: true,
        multiple: false,
      },
    ],
  },
  {
    id: "2",
    name: "Chả giò chiên giòn",
    description: "Chả giò thịt heo, mộc nhĩ, miến, chiên vàng giòn",
    price: 75000,
    image: "/crispy-fried-spring-rolls-vietnamese.jpg",
    category: "appetizers",
    rating: 4.7,
    reviews: 98,
    isAvailable: true,
  },
  {
    id: "3",
    name: "Phở bò tái nạm",
    description: "Phở với thịt bò tái và nạm, nước dùng xương hầm 12 tiếng",
    price: 85000,
    image: "/vietnamese-pho-bo-beef-noodle-soup.jpg",
    category: "noodles",
    rating: 4.9,
    reviews: 256,
    isAvailable: true,
    modifiers: [
      {
        id: "m2",
        name: "Size",
        options: [
          { id: "o3", name: "Nhỏ", price: 0 },
          { id: "o4", name: "Lớn", price: 25000 },
        ],
        required: true,
        multiple: false,
      },
      {
        id: "m3",
        name: "Thêm",
        options: [
          { id: "o5", name: "Thêm thịt", price: 30000 },
          { id: "o6", name: "Thêm bánh phở", price: 15000 },
          { id: "o7", name: "Trứng gà", price: 10000 },
        ],
        required: false,
        multiple: true,
      },
    ],
  },
  {
    id: "4",
    name: "Cơm sườn nướng",
    description: "Cơm trắng với sườn heo nướng than, trứng ốp la, dưa leo",
    price: 95000,
    image: "/vietnamese-grilled-pork-chop-rice.jpg",
    category: "rice",
    rating: 4.6,
    reviews: 187,
    isAvailable: true,
  },
  {
    id: "5",
    name: "Bún chả Hà Nội",
    description: "Bún với chả viên và thịt nướng, nước mắm chua ngọt",
    price: 88000,
    image: "/bun-cha-hanoi-grilled-pork-vermicelli.jpg",
    category: "noodles",
    rating: 4.8,
    reviews: 143,
    isAvailable: true,
  },
  {
    id: "6",
    name: "Tôm hùm nướng bơ tỏi",
    description: "Tôm hùm Alaska nướng bơ tỏi, phục vụ với khoai tây nghiền",
    price: 650000,
    image: "/grilled-lobster-with-garlic-butter.jpg",
    category: "seafood",
    rating: 4.9,
    reviews: 67,
    isAvailable: true,
  },
  {
    id: "7",
    name: "Cua rang me",
    description: "Cua biển rang với sốt me chua ngọt đặc trưng",
    price: 450000,
    image: "/tamarind-crab-vietnamese-dish.jpg",
    category: "seafood",
    rating: 4.7,
    reviews: 89,
    isAvailable: true,
  },
  {
    id: "8",
    name: "Bò lúc lắc",
    description: "Thịt bò Úc xào với ớt chuông, hành tây, sốt tiêu đen",
    price: 195000,
    image: "/shaking-beef-vietnamese-bo-luc-lac.jpg",
    category: "main",
    rating: 4.8,
    reviews: 156,
    isAvailable: true,
  },
  {
    id: "9",
    name: "Cà phê sữa đá",
    description: "Cà phê phin truyền thống với sữa đặc",
    price: 35000,
    image: "/vietnamese-iced-coffee-ca-phe-sua-da.jpg",
    category: "drinks",
    rating: 4.9,
    reviews: 312,
    isAvailable: true,
  },
  {
    id: "10",
    name: "Trà đào cam sả",
    description: "Trà xanh ướp với đào, cam tươi và sả thơm",
    price: 45000,
    image: "/peach-tea-with-orange-and-lemongrass.jpg",
    category: "drinks",
    rating: 4.6,
    reviews: 178,
    isAvailable: true,
  },
  {
    id: "11",
    name: "Chè ba màu",
    description: "Chè đậu xanh, đậu đỏ, thạch với nước cốt dừa",
    price: 38000,
    image: "/vietnamese-three-color-dessert-che-ba-mau.jpg",
    category: "desserts",
    rating: 4.5,
    reviews: 94,
    isAvailable: true,
  },
  {
    id: "12",
    name: "Bánh flan caramel",
    description: "Bánh flan mềm mịn với lớp caramel đắng nhẹ",
    price: 32000,
    image: "/caramel-flan-custard-dessert.jpg",
    category: "desserts",
    rating: 4.7,
    reviews: 112,
    isAvailable: true,
  },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}
