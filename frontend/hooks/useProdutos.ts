import { useStock } from "../context/StockContext";

function useProdutos() {
  return useStock().products;
}

export default useProdutos;
