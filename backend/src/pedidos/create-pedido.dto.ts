import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/** DTO for creating a new Pedido. */
export class CreatePedidoDto {
  /** Customer or order name. */
  @IsString()
  @IsNotEmpty()
  nombre: string;

  /** Unit price of the order. */
  @IsNumber()
  precio: number;

  /** ISO 8601 date string for when the order was placed. */
  @IsDateString()
  fecha: string;

  /** Stock availability flag. */
  @IsBoolean()
  stock: boolean;

  /** Optional free-text description. */
  @IsOptional()
  @IsString()
  descripcion?: string;

  /** Optional number of units ordered. */
  @IsOptional()
  @IsNumber()
  cantidad?: number;
}
