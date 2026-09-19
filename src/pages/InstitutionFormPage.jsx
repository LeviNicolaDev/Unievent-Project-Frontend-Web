import { Building2, ImagePlus, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormField } from "../components/forms/FormField.jsx";
import { AdminHeader } from "../components/navigation/AdminHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  getInstitutionById,
  saveInstitution,
} from "../services/institutionService.js";
import { getAssetUrl } from "../utils/formatters.js";

const emptyForm = {
  nome: "",
  nomeAbreviado: "",
  codigo: "",
  cnpj: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  telefone: "",
  site: "",
  isAtivo: true,
};

export function InstitutionFormPage({ mode = "create" }) {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const isEdit = mode === "edit";
  const isGlobalAdmin = user?.roleUsuario === "Admin" && !user?.instituicaoId;

  useEffect(() => {
    let isMounted = true;

    async function loadInstitution() {
      if (!isEdit || !isGlobalAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const institution = await getInstitutionById(id);
        if (!isMounted) return;

        setForm({
          nome: institution.nome || "",
          nomeAbreviado: institution.nomeAbreviado || "",
          codigo: institution.codigo || "",
          cnpj: institution.cnpj || "",
          rua: institution.rua || "",
          numero: institution.numero || "",
          bairro: institution.bairro || "",
          cidade: institution.cidade || "",
          estado: institution.estado || "",
          cep: institution.cep || "",
          telefone: institution.telefone || "",
          site: institution.site || "",
          isAtivo: institution.isAtivo,
        });
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Erro ao carregar instituição");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInstitution();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, isGlobalAdmin]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!isGlobalAdmin) {
      setError("Apenas o Admin UniEvent pode cadastrar instituições.");
      return;
    }

    try {
      await saveInstitution({
        id: isEdit ? id : undefined,
        ...form,
        fotoPerfil: photo,
      });
      setOpen(true);
    } catch (err) {
      setError(err.message || "Erro ao salvar instituição");
    }
  }

  if (!isGlobalAdmin) {
    return (
      <>
        <AdminHeader title="Cadastro Instituição" backTo="/instituicoes" />
        <main className="responsible-editor-page">
          <section className="people-panel">
            <div className="people-empty">
              <Building2 size={36} />
              <p>Apenas o Admin UniEvent pode cadastrar instituições.</p>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Cadastro Instituição" backTo="/instituicoes" />
        <main
          className="responsible-editor-page"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <p>Carregando...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Cadastro Instituição" backTo="/instituicoes" />
      <main className="responsible-editor-page">
        <section className="responsible-editor-hero">
          <div>
            <span className="responsible-editor-eyebrow">
              Cadastro Instituição
            </span>
            <h1>
              {isEdit
                ? "Editar instituição FATEC"
                : "Cadastrar instituição FATEC"}
            </h1>
            <p>
              Crie a instituição primeiro. Depois cadastre o usuário Secretaria
              vinculado a ela.
            </p>
          </div>

          <div
            className="responsible-editor-notes"
            aria-label="Resumo do cadastro"
          >
            <article>
              <Building2 size={20} />
              <span>Dados da FATEC</span>
            </article>
            <article>
              <MapPin size={20} />
              <span>Endereço da instituição</span>
            </article>
            <article>
              <ShieldCheck size={20} />
              <span>Isolamento por instituição</span>
            </article>
          </div>
        </section>

        <section className="responsible-editor-card admin-flow-form-card">
          <div className="responsible-editor-card-header">
            <div>
              <span>Formulário</span>
              <h2>Dados da instituição</h2>
            </div>
            <p>
              Informe os dados usados para identificar a FATEC no painel e nas
              listagens públicas.
            </p>
          </div>

          <form className="responsible-form" onSubmit={submit}>
            {error && <div className="admin-flow-alert">{error}</div>}

            <FormField label="Nome oficial">
              <input
                value={form.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                placeholder="FATEC Ferraz de Vasconcelos"
                required
              />
            </FormField>

            <FormField label="Nome abreviado">
              <input
                value={form.nomeAbreviado}
                onChange={(event) =>
                  updateField("nomeAbreviado", event.target.value)
                }
                placeholder="FATEC Ferraz"
              />
            </FormField>

            <FormField label="Código da instituição">
              <input
                value={form.codigo}
                onChange={(event) => updateField("codigo", event.target.value)}
                placeholder="fatec-ferraz"
              />
            </FormField>

            <FormField label="CNPJ">
              <input
                value={form.cnpj}
                onChange={(event) => updateField("cnpj", event.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
            </FormField>

            <FormField label="Rua">
              <span className="admin-flow-input-icon">
                <MapPin size={18} />
                <input
                  value={form.rua}
                  onChange={(event) => updateField("rua", event.target.value)}
                  placeholder="Rua Carlos Barattino"
                  required
                />
              </span>
            </FormField>

            <FormField label="Número">
              <input
                value={form.numero}
                onChange={(event) => updateField("numero", event.target.value)}
                placeholder="Ex.: 908"
                required
              />
            </FormField>

            <FormField label="Bairro">
              <input
                value={form.bairro}
                onChange={(event) => updateField("bairro", event.target.value)}
                placeholder="Vila Romanópolis"
                required
              />
            </FormField>

            <FormField label="Cidade">
              <input
                value={form.cidade}
                onChange={(event) => updateField("cidade", event.target.value)}
                placeholder="Ferraz de Vasconcelos"
                required
              />
            </FormField>

            <FormField label="Estado">
              <input
                value={form.estado}
                onChange={(event) => updateField("estado", event.target.value)}
                placeholder="SP"
                required
              />
            </FormField>

            <FormField label="CEP">
              <input
                value={form.cep}
                onChange={(event) => updateField("cep", event.target.value)}
                placeholder="08500000"
                required
              />
            </FormField>

            <FormField label="Telefone">
              <input
                value={form.telefone}
                onChange={(event) =>
                  updateField("telefone", event.target.value)
                }
                placeholder="(11) 0000-0000"
              />
            </FormField>

            <FormField label="Site">
              <input
                value={form.site}
                onChange={(event) => updateField("site", event.target.value)}
                placeholder="https://www.fatec.sp.gov.br"
              />
            </FormField>

            <FormField label="Logo ou foto da instituição">
              <span className="admin-flow-file">
                <ImagePlus size={24} />
                <strong>
                  {photo?.name ||
                    (isEdit ? "Manter imagem atual" : "Selecionar imagem")}
                </strong>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setPhoto(event.target.files?.[0] || null)
                  }
                  required={!isEdit}
                />
              </span>
            </FormField>

            <label className="admin-flow-checkbox">
              <input
                type="checkbox"
                checked={form.isAtivo}
                onChange={(event) =>
                  updateField("isAtivo", event.target.checked)
                }
              />
              <span>Instituição ativa</span>
            </label>

            <div className="responsible-form-actions">
              <Button type="submit">
                {isEdit ? "Salvar instituição" : "Cadastrar instituição"}
              </Button>
            </div>
          </form>
        </section>
      </main>

      <Modal
        open={open}
        title="Cadastro Instituição"
        message={
          isEdit
            ? "Instituição atualizada com sucesso."
            : "Instituição cadastrada com sucesso. Agora cadastre o usuário Secretaria vinculado a ela."
        }
        image={getAssetUrl("emoteAcess.png")}
        confirmText="Ok"
        onClose={() => navigate("/instituicoes")}
        onConfirm={() => navigate("/instituicoes")}
      />
    </>
  );
}
