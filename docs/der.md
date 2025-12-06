# Diagrama Entidade-Relacionamento (DER)

Este documento descreve as entidades e relacionamentos principais do banco de dados MIRASWEAR conforme definido em `src/db/schema.ts`. O diagrama abaixo está em formato [Mermaid](https://mermaid.js.org/) e pode ser renderizado diretamente em plataformas compatíveis (VS Code com extensão apropriada, GitHub, etc.).

```mermaid
erDiagram
    USER {
        id text PK
        name text
        email text UK
        cpf text UK
        is_admin bool
    }

    SESSION {
        id text PK
        user_id text FK
        expires_at timestamp
    }

    ACCOUNT {
        id text PK
        user_id text FK
        provider_id text
    }

    VERIFICATION {
        id text PK
        identifier text
        value text
        expires_at timestamp
    }

    CATEGORY {
        id uuid PK
        name text
        slug text UK
    }

    PRODUCT {
        id uuid PK
        category_id uuid FK
        name text
        slug text UK
        is_active bool
    }

    PRODUCT_VARIANT {
        id uuid PK
        product_id uuid FK
        name text
        slug text UK
        color text
        price_in_cents integer
        is_active bool
    }

    PRODUCT_VARIANT_SIZE {
        id uuid PK
        product_variant_id uuid FK
        size text
    }

    INVENTORY_ITEM {
        id uuid PK
        product_variant_id uuid FK
        product_variant_size_id uuid FK
        quantity integer
    }

    SHIPPING_ADDRESS {
        id uuid PK
        user_id text FK
        recipient_name text
        zip_code text
    }

    CART {
        id uuid PK
        user_id text FK
        shipping_address_id uuid FK
    }

    CART_ITEM {
        id uuid PK
        cart_id uuid FK
        product_variant_id uuid FK
        product_variant_size_id uuid FK
        quantity integer
    }

    ORDER {
        id uuid PK
        user_id text FK
        shipping_address_id uuid FK
        total_price_in_cents integer
        status string
    }

    ORDER_ITEM {
        id uuid PK
        order_id uuid FK
        product_variant_id uuid FK
        product_variant_size_id uuid FK
        quantity integer
        price_in_cents integer
    }

    RESERVATION {
        id uuid PK
        order_id uuid FK
        product_variant_id uuid FK
        product_variant_size_id uuid FK
        quantity integer
        expires_at timestamp
    }

    USER ||--o{ SESSION : "inicia"
    USER ||--o{ ACCOUNT : "autentica"
    USER ||--o{ SHIPPING_ADDRESS : "mantém"
    USER ||--o| CART : "possui"
    USER ||--o{ ORDER : "realiza"

    CATEGORY ||--o{ PRODUCT : "agrupa"
    PRODUCT ||--o{ PRODUCT_VARIANT : "oferece"
    PRODUCT_VARIANT ||--o{ PRODUCT_VARIANT_SIZE : "define"
    PRODUCT_VARIANT ||--o{ INVENTORY_ITEM : "controla"
    PRODUCT_VARIANT_SIZE ||--o{ INVENTORY_ITEM : "dimensiona"

    PRODUCT_VARIANT ||--o{ CART_ITEM : "adicionado"
    PRODUCT_VARIANT_SIZE ||--o{ CART_ITEM : "(opcional)"
    CART ||--o{ CART_ITEM : "contém"
    SHIPPING_ADDRESS ||--o{ CART : "associa (opcional)"

    ORDER ||--o{ ORDER_ITEM : "inclui"
    PRODUCT_VARIANT ||--o{ ORDER_ITEM : "vendido"
    PRODUCT_VARIANT_SIZE ||--o{ ORDER_ITEM : "(opcional)"
    SHIPPING_ADDRESS ||--o{ ORDER : "entrega"

    ORDER ||--o{ RESERVATION : "reserva"
    PRODUCT_VARIANT ||--o{ RESERVATION : "bloqueia"
    PRODUCT_VARIANT_SIZE ||--o{ RESERVATION : "(opcional)"
```

## Notas adicionais

- O campo `status` da tabela `order` representa o enum `order_status` (`pending`, `processing`, `paid`, `shipped`, `delivered`, `canceled`).
- Tabelas de autenticação (`session`, `account`, `verification`) fazem parte da integração com o sistema de login e não se relacionam diretamente com o domínio de pedidos além do vínculo com `user`.
- Alguns relacionamentos no schema permitem `NULL` (por exemplo, endereço associado ao carrinho, tamanho da variante em itens). Esses casos continuam opcionais mesmo sem a marcação direta no diagrama.

Para editar o diagrama, ajuste o bloco Mermaid acima. Você pode validar o resultado abrindo o arquivo no VS Code com uma extensão Mermaid ou visualizando via `npx @mermaid-js/mermaid-cli` se preferir gerar imagens.
