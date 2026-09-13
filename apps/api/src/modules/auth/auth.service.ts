import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../lib/jwt';

export class AuthService {
  static async register(email: string, password: string, nickname: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname,
        isGuest: false,
      },
    });

    const token = generateToken({ userId: user.id, isGuest: false });
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || user.isGuest) {
      throw new Error('Credenciales inválidas.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Credenciales inválidas.');
    }

    const token = generateToken({ userId: user.id, isGuest: false });
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async createGuest(nickname: string) {
    const user = await prisma.user.create({
      data: {
        nickname,
        isGuest: true,
      },
    });

    const token = generateToken({ userId: user.id, isGuest: true });
    return { user, token };
  }
}
