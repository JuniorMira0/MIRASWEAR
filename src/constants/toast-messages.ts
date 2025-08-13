export const TOAST_MESSAGES = {
  CART: {
    PRODUCT_REMOVED: "Produto removido do carrinho com sucesso!",
    PRODUCT_REMOVED_ERROR: "Erro ao remover produto do carrinho.",
    QUANTITY_INCREASED: "Quantidade do produto aumentada.",
    QUANTITY_DECREASED: "Quantidade do produto diminuída com sucesso!",
    QUANTITY_DECREASED_ERROR: "Erro ao diminuir quantidade do produto.",
  },
  ADDRESS: {
    CREATED_SUCCESS: "Endereço criado com sucesso!",
    CREATED_ERROR: "Erro ao criar endereço. Tente novamente.",
    LINKED_SUCCESS: "Endereço vinculado ao carrinho!",
    SELECTED_SUCCESS: "Endereço selecionado para entrega!",
    SELECTED_ERROR: "Erro ao selecionar endereço. Tente novamente.",
  },
  AUTH: {
    USER_NOT_FOUND: "Usuário não encontrado. Verifique o e-mail digitado.",
    INVALID_CREDENTIALS: "E-mail ou senha incorretos. Tente novamente.",
    LOGIN_ERROR: "Erro ao fazer login. Tente novamente.",
    EMAIL_ALREADY_EXISTS: "E-mail já cadastrado.",
  },
} as const;
