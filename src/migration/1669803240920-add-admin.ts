import { MigrationInterface, QueryRunner } from 'typeorm';
import { hash } from 'bcrypt';

export class addAdmin1669803240920 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usernameAndPasswordInPlaintext = 'admin';
    const passwordHash = await hash(usernameAndPasswordInPlaintext, 10);

    await queryRunner.query(
      `INSERT INTO users ("username", "password") VALUES ('${usernameAndPasswordInPlaintext}','${passwordHash}');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE username = 'admin';`);
  }
}
