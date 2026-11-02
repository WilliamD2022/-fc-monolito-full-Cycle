export interface AddProductFacadeInputDto {
  id?: string;
  name: string;
  description: string;
  purchasePrice: number;
  salesPrice: number;
  stock: number;
}

export interface AddProductFacadeOutputDto {
  id: string;
  name: string;
  description: string;
  purchasePrice: number;
  salesPrice: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckStockFacadeInputDto {
  productId: string;
}

export interface CheckStockFacadeOutputDto {
  productId: string;
  stock: number;
}

export default interface ProductAdmFacadeInterface {
  addProduct(
    input: AddProductFacadeInputDto
  ): Promise<AddProductFacadeOutputDto>;
  checkStock(
    input: CheckStockFacadeInputDto
  ): Promise<CheckStockFacadeOutputDto>;
}
