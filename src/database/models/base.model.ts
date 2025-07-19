import { Column, PrimaryKey, Table } from 'sequelize-typescript';
import { DateModel } from './date.model';

@Table({})
export class BaseModel<T> extends DateModel<T> {
  @PrimaryKey
  @Column
  declare public id: number;
}
