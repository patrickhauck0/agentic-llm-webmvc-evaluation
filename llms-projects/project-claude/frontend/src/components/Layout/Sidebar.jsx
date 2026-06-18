// ============================================================
// Sidebar — Menu lateral com lista de projetos
//
// Exibe a lista de projetos do usuário com:
//   - Indicador visual do projeto selecionado
//   - Ações de editar / excluir (ao passar o mouse)
//   - Botão "Novo Projeto" no rodapé
//   - Comportamento de gaveta no mobile (backdrop + close)
//
// Props:
//   aberta          — boolean, controla se está aberta no mobile
//   onFechar        — callback para fechar a sidebar (mobile)
//   onNovoProjeto   — callback para abrir modal de criação
//   onEditarProjeto — callback(projeto) para abrir modal de edição
//   onExcluirProjeto — callback(projeto) para confirmar exclusão
// ============================================================

import { useProjects } from '../../contexts/ProjectContext';
import Spinner from '../UI/Spinner';
import './Sidebar.css';

export default function Sidebar({
  aberta,
  onFechar,
  onNovoProjeto,
  onEditarProjeto,
  onExcluirProjeto,
}) {
  const {
    projetos,
    projetoSelecionado,
    carregandoProjetos,
    selecionarProjeto,
  } = useProjects();

  // Selecionar projeto e fechar sidebar no mobile
  function handleSelecionarProjeto(projeto) {
    selecionarProjeto(projeto);
    // No mobile, fechar a sidebar após selecionar
    if (window.innerWidth <= 768) {
      onFechar();
    }
  }

  // Impedir propagação nos botões de ação
  function handleEditar(e, projeto) {
    e.stopPropagation();
    onEditarProjeto(projeto);
  }

  function handleExcluir(e, projeto) {
    e.stopPropagation();
    onExcluirProjeto(projeto);
  }

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className={`sidebar__backdrop${aberta ? ' sidebar__backdrop--visible' : ''}`}
        onClick={onFechar}
      />

      {/* Sidebar */}
      <aside className={`sidebar${aberta ? ' sidebar--aberta' : ''}`}>
        {/* Botão de fechar (mobile only) */}
        <button
          type="button"
          className="sidebar__close-btn"
          onClick={onFechar}
          aria-label="Fechar menu"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Título da seção */}
        <div className="sidebar__title">Meus Projetos</div>

        {/* Lista de projetos */}
        <ul className="sidebar__list">
          {carregandoProjetos ? (
            <li className="sidebar__loading">
              <Spinner size={20} />
              <span>Carregando…</span>
            </li>
          ) : projetos.length === 0 ? (
            <li className="sidebar__empty">
              Nenhum projeto encontrado.
              <br />
              Crie seu primeiro projeto!
            </li>
          ) : (
            projetos.map((projeto) => {
              const selecionado =
                projetoSelecionado?.id_projeto === projeto.id_projeto;

              return (
                <li
                  key={projeto.id_projeto}
                  className={`sidebar__item${selecionado ? ' sidebar__item--selected' : ''}`}
                  onClick={() => handleSelecionarProjeto(projeto)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelecionarProjeto(projeto);
                    }
                  }}
                >
                  {/* Dot indicador */}
                  <span
                    className={`sidebar__dot${selecionado ? ' sidebar__dot--selected' : ''}`}
                  />

                  {/* Nome do projeto */}
                  <span className="sidebar__item-name">{projeto.nome}</span>

                  {/* Ações (edit + delete) — visíveis no hover */}
                  <div className="sidebar__item-actions">
                    {/* Editar */}
                    <button
                      type="button"
                      className="sidebar__action-btn"
                      onClick={(e) => handleEditar(e, projeto)}
                      aria-label={`Editar projeto ${projeto.nome}`}
                      title="Editar projeto"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    {/* Excluir */}
                    <button
                      type="button"
                      className="sidebar__action-btn sidebar__action-btn--danger"
                      onClick={(e) => handleExcluir(e, projeto)}
                      aria-label={`Excluir projeto ${projeto.nome}`}
                      title="Excluir projeto"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        {/* Rodapé: Novo Projeto */}
        <div className="sidebar__footer">
          <button
            type="button"
            className="sidebar__new-btn"
            onClick={onNovoProjeto}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            Novo Projeto
          </button>
        </div>
      </aside>
    </>
  );
}
