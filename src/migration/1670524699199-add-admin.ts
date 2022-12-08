import { MigrationInterface, QueryRunner } from 'typeorm';
import { hash } from 'bcrypt';

export class addAdmin1670524699199 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usernameInPlaintext = 'admin@gmail.com';
    const passwordInPlaintext = 'admin';
    const passwordHash = await hash(passwordInPlaintext, 10);

    await queryRunner.query(
      `INSERT INTO users ("email", "password") VALUES ('${usernameInPlaintext}','${passwordHash}');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE email = 'admin@gmail.com';`,
    );
  }
}
