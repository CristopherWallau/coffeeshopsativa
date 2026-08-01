# Sativa Coffee Shop

Catálogo digital React, organizado em camadas de Clean Architecture:

- `src/domain`: entidades e regras de negócio puras.
- `src/application`: casos de uso da aplicação.
- `src/infrastructure`: detalhes externos, como a integração SheetDB.
- `src/presentation`: React, componentes, hooks e estilos.
- `src/config` e `src/shared`: configuração e utilitários transversais.

## Executar

```bash
npm install
npm run dev
```

Para gerar a versão de produção, execute `npm run build`.
