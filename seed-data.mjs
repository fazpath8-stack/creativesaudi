import { drizzle } from "drizzle-orm/mysql2";
import { designSoftware, services } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const softwareData = [
  { name: "Adobe Photoshop", nameAr: "أدوبي فوتوشوب", category: "photo" },
  { name: "Adobe Illustrator", nameAr: "أدوبي إليستريتور", category: "photo" },
  { name: "Adobe InDesign", nameAr: "أدوبي إن ديزاين", category: "photo" },
  { name: "Adobe Premiere Pro", nameAr: "أدوبي بريمير برو", category: "video" },
  { name: "Adobe After Effects", nameAr: "أدوبي أفتر إفكتس", category: "video" },
  { name: "Final Cut Pro", nameAr: "فاينال كت برو", category: "video" },
  { name: "DaVinci Resolve", nameAr: "دافنشي ريزولف", category: "video" },
  { name: "Figma", nameAr: "فيجما", category: "ui" },
  { name: "Sketch", nameAr: "سكيتش", category: "ui" },
  { name: "Adobe XD", nameAr: "أدوبي إكس دي", category: "ui" },
  { name: "Blender", nameAr: "بلندر", category: "3d" },
  { name: "Cinema 4D", nameAr: "سينما فور دي", category: "3d" },
  { name: "Maya", nameAr: "مايا", category: "3d" },
  { name: "3ds Max", nameAr: "ثري دي إس ماكس", category: "3d" },
  { name: "CorelDRAW", nameAr: "كوريل درو", category: "photo" },
  { name: "Canva", nameAr: "كانفا", category: "photo" },
];

const servicesData = [
  {
    name: "Logo Design",
    nameAr: "تصميم شعار",
    description: "Professional logo design for your brand identity",
    descriptionAr: "تصميم شعار احترافي لهوية علامتك التجارية",
    price: 50000, // 500 SAR
    category: "photo",
    isActive: true,
  },
  {
    name: "Business Card Design",
    nameAr: "تصميم بطاقة عمل",
    description: "Custom business card design with modern aesthetics",
    descriptionAr: "تصميم بطاقة عمل مخصصة بجماليات عصرية",
    price: 15000, // 150 SAR
    category: "photo",
    isActive: true,
  },
  {
    name: "Social Media Post Design",
    nameAr: "تصميم منشور لوسائل التواصل",
    description: "Eye-catching social media graphics for your campaigns",
    descriptionAr: "رسومات جذابة لوسائل التواصل الاجتماعي لحملاتك",
    price: 8000, // 80 SAR
    category: "photo",
    isActive: true,
  },
  {
    name: "Video Editing",
    nameAr: "مونتاج فيديو",
    description: "Professional video editing with effects and transitions",
    descriptionAr: "مونتاج فيديو احترافي مع المؤثرات والانتقالات",
    price: 30000, // 300 SAR
    category: "video",
    isActive: true,
  },
  {
    name: "Motion Graphics",
    nameAr: "موشن جرافيك",
    description: "Animated graphics and visual effects for videos",
    descriptionAr: "رسومات متحركة ومؤثرات بصرية للفيديوهات",
    price: 45000, // 450 SAR
    category: "video",
    isActive: true,
  },
  {
    name: "UI/UX Design",
    nameAr: "تصميم واجهة المستخدم",
    description: "User interface and experience design for apps and websites",
    descriptionAr: "تصميم واجهة وتجربة المستخدم للتطبيقات والمواقع",
    price: 80000, // 800 SAR
    category: "ui",
    isActive: true,
  },
  {
    name: "3D Modeling",
    nameAr: "نمذجة ثلاثية الأبعاد",
    description: "3D models for products, characters, and environments",
    descriptionAr: "نماذج ثلاثية الأبعاد للمنتجات والشخصيات والبيئات",
    price: 100000, // 1000 SAR
    category: "3d",
    isActive: true,
  },
  {
    name: "Banner Design",
    nameAr: "تصميم بانر",
    description: "Web banners and advertising graphics",
    descriptionAr: "بانرات الويب والرسومات الإعلانية",
    price: 12000, // 120 SAR
    category: "photo",
    isActive: true,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Insert design software
    console.log("📦 Inserting design software...");
    for (const software of softwareData) {
      await db.insert(designSoftware).values(software);
    }
    console.log(`✅ Inserted ${softwareData.length} design software entries`);

    // Insert services
    console.log("🛠️ Inserting services...");
    for (const service of servicesData) {
      await db.insert(services).values(service);
    }
    console.log(`✅ Inserted ${servicesData.length} services`);

    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
