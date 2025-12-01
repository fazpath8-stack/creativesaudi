import { drizzle } from 'drizzle-orm/mysql2';
import { users } from './drizzle/schema.ts';
import { nanoid } from 'nanoid';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/creativesaudi';

async function addAdmin() {
  try {
    const db = drizzle(DATABASE_URL);
    
    // Hash password (simple base64 for demo)
    const password = Buffer.from('iFazx@10').toString('base64');
    
    // Create admin user
    await db.insert(users).values({
      openId: `admin-${nanoid()}`,
      email: 'fazpath8@gmail.com',
      password: password,
      name: 'Admin',
      loginMethod: 'local',
      role: 'admin',
      userType: 'client',
      firstName: 'Admin',
      lastName: 'CreativeSaudi',
      phoneNumber: '+966',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('Email: fazpath8@gmail.com');
    console.log('Password: iFazx@10');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

addAdmin();
