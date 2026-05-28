const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false
});

function validarCampos(body, campos) {
  return campos.filter((campo) => {
    return (
      body[campo] === undefined || body[campo] === null || body[campo] === ""
    );
  });
}

app.get("/", (req, res) => {
  res.status(200).json({
    mensagem: "API REST da NexusStore funcionando com Node.js e PostgreSQL",
  });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      api: "online",
      banco: "conectado",
    });
  } catch (error) {
    console.error("Erro no health check:", error);

    res.status(500).json({
      status: "erro",
      api: "online",
      banco: "erro ao conectar",
      detalhe: error.message,
    });
  }
});

/* 
   CLIENTES
 */

app.get("/clientes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM clientes ORDER BY id ASC",
    );
    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar clientes." });
  }
});

app.get("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query("SELECT * FROM clientes WHERE id = $1", [
      id,
    ]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar cliente." });
  }
});

app.post("/clientes", async (req, res) => {
  try {
    const camposObrigatorios = ["nome", "email", "telefone", "cpf"];
    const camposFaltando = validarCampos(req.body, camposObrigatorios);

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        erro: "Campos obrigatórios faltando.",
        campos: camposFaltando,
      });
    }

    const { nome, email, telefone, cpf } = req.body;

    const resultado = await pool.query(
      `INSERT INTO clientes (nome, email, telefone, cpf)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, email, telefone, cpf],
    );

    res.status(201).json({
      mensagem: "Cliente cadastrado com sucesso.",
      cliente: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar cliente." });
  }
});

app.put("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const camposObrigatorios = ["nome", "email", "telefone", "cpf"];
    const camposFaltando = validarCampos(req.body, camposObrigatorios);

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        erro: "Campos obrigatórios faltando.",
        campos: camposFaltando,
      });
    }

    const { nome, email, telefone, cpf } = req.body;

    const resultado = await pool.query(
      `UPDATE clientes
       SET nome = $1, email = $2, telefone = $3, cpf = $4
       WHERE id = $5
       RETURNING *`,
      [nome, email, telefone, cpf, id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    res.status(200).json({
      mensagem: "Cliente atualizado com sucesso.",
      cliente: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar cliente." });
  }
});

app.delete("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM clientes WHERE id = $1 RETURNING *",
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    res.status(200).json({
      mensagem: "Cliente removido com sucesso.",
      cliente: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover cliente." });
  }
});

/* 
   FUNCIONÁRIOS
 */

app.get("/funcionarios", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM funcionarios ORDER BY id ASC",
    );
    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar funcionários." });
  }
});

app.get("/funcionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "SELECT * FROM funcionarios WHERE id = $1",
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar funcionário." });
  }
});

app.post("/funcionarios", async (req, res) => {
  try {
    const camposObrigatorios = ["nome", "telefone", "email", "cargo", "setor"];
    const camposFaltando = validarCampos(req.body, camposObrigatorios);

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        erro: "Campos obrigatórios faltando.",
        campos: camposFaltando,
      });
    }

    const { nome, telefone, email, cargo, setor } = req.body;

    const resultado = await pool.query(
      `INSERT INTO funcionarios (nome, telefone, email, cargo, setor)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, telefone, email, cargo, setor],
    );

    res.status(201).json({
      mensagem: "Funcionário cadastrado com sucesso.",
      funcionario: resultado.rows[0],
    });
  } catch (error) {
    console.log("Erro ao cadastrar funcionário:");
    console.log(error);

    res.status(500).json({
      erro: "Erro ao cadastrar funcionário.",
      detalhe: error.message,
    });
  }
});
app.put("/funcionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const camposObrigatorios = ["nome", "telefone", "email", "cargo", "setor"];
    const camposFaltando = validarCampos(req.body, camposObrigatorios);

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        erro: "Campos obrigatórios faltando.",
        campos: camposFaltando,
      });
    }

    const { nome, telefone, email, cargo, setor } = req.body;

    const resultado = await pool.query(
      `UPDATE funcionarios
       SET nome = $1, telefone = $2, email = $3, cargo = $4, setor = $5
       WHERE id = $6
       RETURNING *`,
      [nome, telefone, email, cargo, setor, id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
    }

    res.status(200).json({
      mensagem: "Funcionário atualizado com sucesso.",
      funcionario: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar funcionário." });
  }
});

app.delete("/funcionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM funcionarios WHERE id = $1 RETURNING *",
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
    }

    res.status(200).json({
      mensagem: "Funcionário removido com sucesso.",
      funcionario: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover funcionário." });
  }
});

/* 
   PRODUTOS
*/

app.get("/produtos", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM produtos ORDER BY id ASC",
    );
    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar produtos." });
  }
});

app.get("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query("SELECT * FROM produtos WHERE id = $1", [
      id,
    ]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar produto." });
  }
});

app.post("/produtos", async (req, res) => {
  try {
    const camposObrigatorios = ["nome", "lote", "quantidade", "preco"];
    const camposFaltando = validarCampos(req.body, camposObrigatorios);

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        erro: "Campos obrigatórios faltando.",
        campos: camposFaltando,
      });
    }

    const { nome, lote } = req.body;
    const quantidade = Number(req.body.quantidade);
    const preco = Number(req.body.preco);

    if (!Number.isInteger(quantidade)) {
      return res.status(400).json({
        erro: "O campo quantidade deve ser um número inteiro.",
      });
    }

    if (Number.isNaN(preco)) {
      return res.status(400).json({
        erro: "O campo preco deve ser um número.",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO produtos (nome, lote, quantidade, preco)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, lote, quantidade, preco],
    );

    res.status(201).json({
      mensagem: "Produto cadastrado com sucesso.",
      produto: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar produto." });
  }
});

app.put("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const camposObrigatorios = ["nome", "lote", "quantidade", "preco"];
    const camposFaltando = validarCampos(req.body, camposObrigatorios);

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        erro: "Campos obrigatórios faltando.",
        campos: camposFaltando,
      });
    }

    const { nome, lote } = req.body;
    const quantidade = Number(req.body.quantidade);
    const preco = Number(req.body.preco);

    if (!Number.isInteger(quantidade)) {
      return res.status(400).json({
        erro: "O campo quantidade deve ser um número inteiro.",
      });
    }

    if (Number.isNaN(preco)) {
      return res.status(400).json({
        erro: "O campo preco deve ser um número.",
      });
    }

    const resultado = await pool.query(
      `UPDATE produtos
       SET nome = $1, lote = $2, quantidade = $3, preco = $4
       WHERE id = $5
       RETURNING *`,
      [nome, lote, quantidade, preco, id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    res.status(200).json({
      mensagem: "Produto atualizado com sucesso.",
      produto: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar produto." });
  }
});

app.delete("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM produtos WHERE id = $1 RETURNING *",
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    res.status(200).json({
      mensagem: "Produto removido com sucesso.",
      produto: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover produto." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
