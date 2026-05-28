import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  UserRoundCog,
  Package,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Store,
} from "lucide-react";
import "./App.css";

// Configuração da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://nexusstore-erpnexusstore-api-production.up.railway.app",
});
// Configuração dos módulos
const entidades = {
  clientes: {
    titulo: "Clientes",
    subtitulo: "Gerencie os clientes cadastrados na NexusStore.",
    rota: "/clientes",
    icone: Users,
    campos: [
      { nome: "nome", label: "Nome", tipo: "text" },
      { nome: "email", label: "E-mail", tipo: "email" },
      { nome: "telefone", label: "Telefone", tipo: "text" },
      { nome: "cpf", label: "CPF", tipo: "text" },
    ],
    colunas: ["id", "nome", "email", "telefone", "cpf"],
  },

  funcionarios: {
    titulo: "Funcionários",
    subtitulo: "Controle colaboradores, cargos e setores da empresa.",
    rota: "/funcionarios",
    icone: UserRoundCog,
    campos: [
      { nome: "nome", label: "Nome", tipo: "text" },
      { nome: "telefone", label: "Telefone", tipo: "text" },
      { nome: "email", label: "E-mail", tipo: "email" },
      { nome: "cargo", label: "Cargo", tipo: "text" },
      { nome: "setor", label: "Setor", tipo: "text" },
    ],
    colunas: ["id", "nome", "telefone", "email", "cargo", "setor"],
  },

  produtos: {
    titulo: "Produtos",
    subtitulo: "Acompanhe estoque, lote, quantidade e preço.",
    rota: "/produtos",
    icone: Package,
    campos: [
      { nome: "nome", label: "Nome do produto", tipo: "text" },
      { nome: "lote", label: "Lote", tipo: "text" },
      { nome: "quantidade", label: "Quantidade", tipo: "number" },
      { nome: "preco", label: "Preço", tipo: "number" },
    ],
    colunas: ["id", "nome", "lote", "quantidade", "preco"],
  },
};

function App() {
  // Estados principais
  const [abaAtiva, setAbaAtiva] = useState("clientes");
  const [dados, setDados] = useState([]);
  const [formulario, setFormulario] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  // Entidade selecionada
  const entidadeAtual = entidades[abaAtiva];
  const IconeAtual = entidadeAtual.icone;

  // Busca registros na API
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);

      const resposta = await api.get(entidadeAtual.rota);
      setDados(resposta.data);
    } catch {
      setMensagem("Erro ao carregar dados da API.");
    } finally {
      setCarregando(false);
    }
  }, [entidadeAtual.rota]);

  // Carrega dados ao trocar módulo
  useEffect(() => {
    let componenteAtivo = true;

    async function buscarDadosIniciais() {
      try {
        const resposta = await api.get(entidadeAtual.rota);

        if (componenteAtivo) {
          setDados(resposta.data);
        }
      } catch {
        if (componenteAtivo) {
          setMensagem("Erro ao carregar dados da API.");
        }
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    buscarDadosIniciais();

    return () => {
      componenteAtivo = false;
    };
  }, [entidadeAtual.rota]);

  // Troca aba e limpa formulário
  function trocarAba(chave) {
    setAbaAtiva(chave);
    setFormulario({});
    setEditandoId(null);
    setMensagem("");
    setCarregando(true);
  }

  // Atualiza campos do formulário
  function atualizarCampo(campo, valor) {
    setFormulario({
      ...formulario,
      [campo]: valor,
    });
  }

  // Atualiza lista manualmente
  function atualizarLista() {
    setCarregando(true);
    carregarDados();
  }

  // Cadastra ou atualiza registro
  async function salvarRegistro(event) {
    event.preventDefault();

    try {
      if (editandoId) {
        await api.put(`${entidadeAtual.rota}/${editandoId}`, formulario);
        setMensagem("Registro atualizado com sucesso.");
      } else {
        await api.post(entidadeAtual.rota, formulario);
        setMensagem("Registro cadastrado com sucesso.");
      }

      setFormulario({});
      setEditandoId(null);
      setCarregando(true);
      carregarDados();
    } catch (error) {
      if (error.response?.data?.erro) {
        setMensagem(error.response.data.erro);
      } else {
        setMensagem("Erro ao salvar registro.");
      }
    }
  }

  // Preenche formulário para edição
  function editarRegistro(item) {
    const novoFormulario = {};

    entidadeAtual.campos.forEach((campo) => {
      novoFormulario[campo.nome] = item[campo.nome];
    });

    setFormulario(novoFormulario);
    setEditandoId(item.id);
    setMensagem("Editando registro selecionado.");
  }

  // Exclui registro
  async function excluirRegistro(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este registro?",
    );

    if (!confirmar) return;

    try {
      await api.delete(`${entidadeAtual.rota}/${id}`);
      setMensagem("Registro removido com sucesso.");
      setCarregando(true);
      carregarDados();
    } catch {
      setMensagem("Erro ao excluir registro.");
    }
  }

  // Cancela edição
  function cancelarEdicao() {
    setFormulario({});
    setEditandoId(null);
    setMensagem("");
  }

  return (
    <div className="app">
      {/* Menu lateral */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Store size={28} />
          </div>

          <div>
            <h1>NexusStore</h1>
            <p>ERP Core System</p>
          </div>
        </div>

        <nav className="menu">
          {Object.entries(entidades).map(([chave, entidade]) => {
            const Icone = entidade.icone;

            return (
              <button
                key={chave}
                className={
                  abaAtiva === chave ? "menu-item active" : "menu-item"
                }
                onClick={() => trocarAba(chave)}
              >
                <Icone size={20} />
                <span>{entidade.titulo}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>API REST + PostgreSQL</p>
          <strong>Node.js</strong>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="content">
        <header className="topbar">
          <div>
            <span className="tag">Sistema Comercial</span>
            <h2>{entidadeAtual.titulo}</h2>
            <p>{entidadeAtual.subtitulo}</p>
          </div>

          <button className="refresh-button" onClick={atualizarLista}>
            <RefreshCcw size={18} />
            Atualizar
          </button>
        </header>

        {/* Cards de resumo */}
        <section className="stats-grid">
          <div className="stat-card">
            <span>Total de registros</span>
            <strong>{dados.length}</strong>
          </div>

          <div className="stat-card">
            <span>Módulo ativo</span>
            <strong>{entidadeAtual.titulo}</strong>
          </div>

          <div className="stat-card">
            <span>Status da API</span>
            <strong className="online">Online</strong>
          </div>
        </section>

        <section className="main-grid">
          {/* Formulário */}
          <div className="card form-card">
            <div className="card-title">
              <IconeAtual size={22} />
              <div>
                <h3>{editandoId ? "Editar registro" : "Novo cadastro"}</h3>
                <p>
                  {editandoId
                    ? `Atualizando o registro ID ${editandoId}`
                    : "Preencha os dados para cadastrar."}
                </p>
              </div>
            </div>

            <form onSubmit={salvarRegistro}>
              {entidadeAtual.campos.map((campo) => (
                <label key={campo.nome}>
                  {campo.label}
                  <input
                    type={campo.tipo}
                    step={campo.nome === "preco" ? "0.01" : undefined}
                    value={formulario[campo.nome] || ""}
                    onChange={(event) =>
                      atualizarCampo(campo.nome, event.target.value)
                    }
                    placeholder={`Digite ${campo.label.toLowerCase()}`}
                  />
                </label>
              ))}

              <div className="form-actions">
                <button type="submit" className="primary-button">
                  <Plus size={18} />
                  {editandoId ? "Salvar edição" : "Cadastrar"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cancelarEdicao}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {mensagem && <div className="message">{mensagem}</div>}
          </div>

          {/* Tabela */}
          <div className="card table-card">
            <div className="card-title table-header">
              <div>
                <h3>Registros cadastrados</h3>
                <p>Dados vindos diretamente da API REST.</p>
              </div>
            </div>

            {carregando ? (
              <div className="empty">Carregando dados...</div>
            ) : dados.length === 0 ? (
              <div className="empty">Nenhum registro encontrado.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {entidadeAtual.colunas.map((coluna) => (
                        <th key={coluna}>{coluna}</th>
                      ))}
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dados.map((item) => (
                      <tr key={item.id}>
                        {entidadeAtual.colunas.map((coluna) => (
                          <td key={coluna}>
                            {coluna === "preco"
                              ? `R$ ${Number(item[coluna]).toFixed(2)}`
                              : item[coluna]}
                          </td>
                        ))}

                        <td>
                          <div className="actions">
                            <button
                              className="icon-button edit"
                              onClick={() => editarRegistro(item)}
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="icon-button delete"
                              onClick={() => excluirRegistro(item.id)}
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
