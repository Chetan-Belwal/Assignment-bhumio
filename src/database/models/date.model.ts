import {
  Column,
  CreatedAt,
  DataType,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';

export abstract class DateModel<T> extends Model<T> {
  @CreatedAt
  @Column(DataType.DATE)
  public created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  public updated_at: Date;
}
