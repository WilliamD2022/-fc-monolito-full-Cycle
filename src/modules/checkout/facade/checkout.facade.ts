import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import CheckoutFacadeInterface, {
  PlaceOrderFacadeInputDto,
  PlaceOrderFacadeOutputDto,
} from "./checkout.facade.interface";

export interface UseCaseProps {
  placeOrderUsecase: UseCaseInterface;
}

export default class CheckoutFacade implements CheckoutFacadeInterface {
  private _placeOrderUsecase: UseCaseInterface;

  constructor(usecaseProps: UseCaseProps) {
    this._placeOrderUsecase = usecaseProps.placeOrderUsecase;
  }

  async placeOrder(
    input: PlaceOrderFacadeInputDto
  ): Promise<PlaceOrderFacadeOutputDto> {
    return await this._placeOrderUsecase.execute(input);
  }
}
