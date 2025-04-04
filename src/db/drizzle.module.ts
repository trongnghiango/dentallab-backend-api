import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';

export const DRIZZLE = Symbol('drizzle-connection');
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        //lay Database_url -> create pool -> return {...}
        const dbUrl = configService.get('DATABASE_URL') as string;
        // if (typeof dbUrl !== 'string') {
        //   throw new Error('Invalid DATABASE_URL type');
        // }
        const pool = new Pool({
          connectionString: dbUrl,
          ssl: true,
        });

        return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
