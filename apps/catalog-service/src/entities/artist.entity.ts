import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Album } from './album.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  country: string;

  @OneToMany(() => Album, (album) => album.artist, { cascade: true })
  albums: Album[];
}
