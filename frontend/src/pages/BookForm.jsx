import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Api } from "../API/api";
import { useAuth } from "../auth/AuthContext";
import { Cover } from "../components/ui/Cover";
import { Icon } from "../components/ui/Icon";
import { Spinner } from "../components/ui/Spinner";
import { Toggle } from "../components/ui/Toggle";
import { useLibrary } from "../data/LibraryContext";
import { imageToDataUri } from "../lib/imageToDataUri";

const SUMMARY_MAX = 400;
const EMPTY = {
  name: "",
  author: "",
  pages: "",
  year: "",
  publisher: "",
  isbn: "",
  tags: [],
  available: true,
  isPublic: true,
  summary: "",
};

function isbnError(isbn) {
  const digits = isbn.toUpperCase().replace(/[^0-9X]/g, "");
  return isbn && digits.length !== 10 && digits.length !== 13 ? "ISBN deve ter 10 ou 13 dígitos" : null;
}

function Section({ title, dot = "bg-primary-container", aside, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <header className="mb-5 flex items-center justify-between gap-3 border-b border-hairline pb-4">
        <h2 className="flex items-center gap-3 font-serif text-headline-md">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function TextField({ id, label, hint, icon, suffix, ...props }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
        {hint && <span className="normal-case tracking-normal text-primary-container">{hint}</span>}
      </label>
      <div className="field">
        <input id={id} {...props} />
        {suffix && <span className="text-label-sm text-secondary">{suffix}</span>}
        {icon && <Icon name={icon} />}
      </div>
    </div>
  );
}

function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState("");

  function add() {
    const tag = draft.trim().slice(0, 30);
    if (tag && !tags.includes(tag) && tags.length < 10) onChange([...tags, tag]);
    setDraft("");
  }

  return (
    <div>
      <label className="field-label" htmlFor="book-tags">Gêneros / tags de classificação</label>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary-container py-1 pl-3 pr-1.5 text-label-md text-on-secondary-container">
            {tag}
            <button type="button" className="flex rounded-full p-0.5 hover:bg-black/10" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remover ${tag}`}>
              <Icon name="close" className="text-[14px]" />
            </button>
          </span>
        ))}
        {tags.length < 10 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-outline-variant py-1 pl-3 pr-2 text-label-md text-primary-container focus-within:border-primary-container">
            <Icon name="add" className="text-[16px]" />
            <input
              id="book-tags"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  add();
                }
              }}
              onBlur={add}
              placeholder="Adicionar tag"
              className="w-28 border-none bg-transparent outline-none placeholder:text-primary-container"
            />
          </span>
        )}
      </div>
    </div>
  );
}

function CoverPicker({ cover, book, onPick, onRemove }) {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);

  function drop(event) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onPick(file);
  }

  return (
    <section className="card p-5 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-label-lg">
          <Icon name="image" className="text-[20px] text-secondary" /> Capa da obra
        </h2>
        <span className="rounded-full bg-secondary-container px-2.5 py-1 text-label-sm text-on-secondary-container">Proporção 2:3</span>
      </header>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={`flex flex-col items-center gap-3 rounded-xl p-5 transition-colors ${
          dragging ? "bg-secondary-container" : "bg-surface-container-low"
        }`}
      >
        {cover ? (
          <Cover book={book} src={cover} className="w-40 shadow-raised" />
        ) : (
          <button type="button" onClick={() => input.current.click()} className="flex aspect-[2/3] w-40 flex-col items-center justify-center gap-2 rounded-lg bg-surface-container shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-primary-container">
              <Icon name="add_a_photo" />
            </span>
            <span className="px-3 text-center text-body-sm text-secondary">Nenhuma imagem selecionada</span>
          </button>
        )}
        <p className="hidden text-center text-body-sm text-on-surface sm:block">
          Arraste e solte a imagem aqui
          <span className="block text-secondary">PNG, JPG ou WEBP — reduzida automaticamente</span>
        </p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          if (event.target.files[0]) onPick(event.target.files[0]);
          event.target.value = "";
        }}
      />
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={() => input.current.click()}>
          <Icon name="upload_file" className="text-[18px]" /> {cover ? "Trocar capa" : "Escolher capa"}
        </button>
        {cover && (
          <button type="button" className="btn-secondary px-3" onClick={onRemove} aria-label="Remover capa" title="Remover capa">
            <Icon name="delete" className="text-[18px]" />
          </button>
        )}
      </div>
    </section>
  );
}

export function BookForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reloadBooks } = useLibrary();
  const [fields, setFields] = useState(EMPTY);
  const [cover, setCover] = useState("");
  const [coverChanged, setCoverChanged] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setFields(EMPTY);
      setCover("");
      setCoverChanged(false);
      return;
    }
    setLoading(true);
    Api.books
      .readByID(id)
      .then((book) => {
        setFields({
          ...EMPTY,
          ...Object.fromEntries(Object.keys(EMPTY).map((key) => [key, book[key] ?? EMPTY[key]])),
          pages: book.pages ?? "",
          year: book.year ?? "",
        });
        setCover(book.coverImage ?? "");
        setCoverChanged(false);
      })
      .catch((error) => {
        toast.error(error.message);
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, editing, navigate]);

  const set = (key) => (event) => setFields((current) => ({ ...current, [key]: event.target.value }));

  async function pickCover(file) {
    try {
      setCover(await imageToDataUri(file));
      setCoverChanged(true);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const error = isbnError(fields.isbn);
    if (error) return toast.error(error);

    const payload = { ...fields };
    if (coverChanged) payload.coverImage = cover;

    setSaving(true);
    try {
      const data = editing ? await Api.books.update(id, payload) : await Api.books.create(payload);
      toast.success(data.message);
      await reloadBooks();
      navigate("/");
    } catch (failure) {
      toast.error(failure.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Carregando livro…" />;

  const previewBook = { name: fields.name, author: fields.author };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex items-start gap-3">
          <Link to="/" className="btn-icon mt-1 h-10 w-10 bg-surface-container lg:hidden" aria-label="Voltar">
            <Icon name="arrow_back" />
          </Link>
          <div>
            <nav className="eyebrow hidden gap-2 lg:flex">
              <Link to="/" className="hover:text-primary-container">Acervo</Link>
              <span>/</span>
              <span className="text-primary-container">{editing ? "Edição" : "Catalogação"}</span>
            </nav>
            <span className="eyebrow lg:hidden">{editing ? "Edição" : "Catalogação"}</span>
            <h1 className="font-serif text-headline-lg-mobile text-primary lg:text-headline-xl">
              {editing ? "Editar Exemplar" : "Adicionar Novo Exemplar"}
            </h1>
            <p className="mt-1 hidden max-w-2xl text-body-md text-secondary sm:block">
              Preencha os dados do volume e adicione uma capa para integrar a obra ao seu acervo compartilhável.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-6">
          <CoverPicker
            cover={cover}
            book={previewBook}
            onPick={pickCover}
            onRemove={() => {
              setCover("");
              setCoverChanged(true);
            }}
          />
          <aside className="flex gap-4 rounded-xl bg-surface-container-low p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-primary-container">
              <Icon name="auto_stories" />
            </span>
            <div>
              <p className="text-label-lg text-primary">Dica de curadoria</p>
              <p className="text-body-sm text-secondary">
                Livros com capa e um resumo pessoal chamam mais atenção dos amigos na sua vitrine.
              </p>
            </div>
          </aside>
          <div className="card flex items-center gap-4 p-5">
            <Icon name="visibility" className="text-secondary" />
            <div className="min-w-0 flex-1">
              <p className="text-label-lg">Exibir na Vitrine Pública</p>
              <p className="truncate text-body-sm text-secondary">Visível no link /u/{user.slug}</p>
            </div>
            <Toggle
              checked={fields.isPublic}
              onChange={(value) => setFields((current) => ({ ...current, isPublic: value }))}
              label="Exibir na vitrine pública"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Section title="Detalhes da Obra">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField id="book-name" label="Título do livro *" icon="menu_book" value={fields.name} onChange={set("name")} placeholder="Ex: Torto Arado" required maxLength={200} />
              </div>
              <div className="sm:col-span-2">
                <TextField id="book-author" label="Nome da autoria *" icon="edit_note" value={fields.author} onChange={set("author")} placeholder="Ex: Itamar Vieira Junior" required maxLength={200} />
              </div>
              <TextField id="book-pages" label="Número de páginas" suffix="págs" type="number" inputMode="numeric" min="1" max="20000" value={fields.pages} onChange={set("pages")} placeholder="264" />
              <TextField id="book-year" label="Ano da edição" icon="calendar_today" type="number" inputMode="numeric" min="0" max="2100" value={fields.year} onChange={set("year")} placeholder="2019" />
              <TextField id="book-publisher" label="Editora" value={fields.publisher} onChange={set("publisher")} placeholder="Ex: Todavia" maxLength={120} />
              <TextField id="book-isbn" label="ISBN (opcional)" hint="10 ou 13 dígitos" value={fields.isbn} onChange={set("isbn")} placeholder="978-6556920009" maxLength={20} />
              <div className="sm:col-span-2">
                <TagInput tags={fields.tags} onChange={(tags) => setFields((current) => ({ ...current, tags }))} />
              </div>
            </div>
          </Section>

          <Section
            title="Status de Disponibilidade"
            dot="bg-secondary"
            aside={<span className="hidden text-body-sm text-secondary sm:block">Estado atual do exemplar</span>}
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                [true, "check_circle", "Disponível"],
                [false, "block", "Indisponível"],
              ].map(([value, icon, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFields((current) => ({ ...current, available: value }))}
                  aria-pressed={fields.available === value}
                  className={`btn h-12 ${
                    fields.available === value
                      ? "bg-primary text-on-primary shadow-card"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <Icon name={icon} className="text-[20px]" /> {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-body-sm text-secondary">
              Livros marcados como “Disponível” podem receber pedidos de empréstimo de amigos e visitantes da sua vitrine.
            </p>
          </Section>

          <Section
            title="Resumo / Sinopse"
            dot="bg-tertiary-container"
            aside={<span className="text-label-md text-secondary">{fields.summary.length}/{SUMMARY_MAX}</span>}
          >
            <textarea
              className="textarea min-h-36"
              value={fields.summary}
              onChange={set("summary")}
              maxLength={SUMMARY_MAX}
              placeholder="Breve resumo da obra para seus amigos lerem no catálogo público…"
            />
            <p className="mt-2 text-body-sm text-secondary">Dica: uma sinopse pessoal engaja mais do que o texto oficial da contracapa.</p>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-[72px] z-30 -mx-4 flex gap-3 border-t border-hairline bg-surface/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:justify-end lg:border-none lg:bg-transparent lg:p-0">
        <Link to="/" className="btn-secondary flex-1 lg:flex-none lg:px-6">Cancelar</Link>
        <button type="submit" className="btn-primary flex-[2] lg:flex-none lg:px-6" disabled={saving}>
          <Icon name="save" className="text-[18px]" />
          {saving ? "Salvando…" : editing ? "Salvar alterações" : "Salvar Livro no Acervo"}
        </button>
      </div>
    </form>
  );
}
