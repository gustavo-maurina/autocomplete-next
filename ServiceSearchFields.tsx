import axios from "axios";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import fieldsStyle from "../styles/ServiceSearchFields.module.scss";
import apiUrl from "../utils/apiUrl";
import isOnMobile from "../utils/isOnMobile";

type searchForm = {
  isValid: boolean;
  values: object;
};

const ButtonDisabledStyle = {
  backgroundColor: "#ddf1ffcc",
  cursor: "not-allowed",
};

const ButtonEnabledStyle = {
  backgroundColor: "#00233c",
  cursor: "pointer",
};

const ServiceSearchFields = () => {
  const [isMobile, setIsMobile] = useState<boolean>();
  const { t } = useTranslation("common");
  const [form, setForm] = useState<searchForm>({ isValid: false, values: [] });
  const router = useRouter();
  const [text, setText] = useState<string>("");
  const [suggestions, setSuggestions] = useState({
    hasFetched: false,
    values: [],
  });

  useEffect(() => {
    const isFormValid = (): void => {
      let isFormValid: boolean = false;
      let properties = Object.keys(form.values);

      if (properties.length) {
        properties.map((property) => {
          if (form.values[property as keyof object] !== "") {
            isFormValid = true;
          }
        });
      }

      if (isFormValid !== form.isValid)
        setForm({ ...form, isValid: isFormValid });
    };

    isFormValid();

    setIsMobile(isOnMobile(window));
    window.onresize = handleResize;
  }, [form]);

  const handleResize = (): void => {
    setIsMobile(isOnMobile(window));
  };

  const handleInput = (event: any) => {
    setForm({
      ...form,
      values: { ...form.values, [event.target.name]: event.target.value },
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    let aux = {};
    Object.keys(form.values).map((property) => {
      const value = form.values[property as keyof object];
      if (value !== "") aux = { ...aux, [property]: value };
    });
    router.push({
      pathname: "/s/search",
      query: { ...aux },
    });
  };

  const getCidades = async (texto: string) => {
    let request = await axios.get(
      `${apiUrl}?metodo=buscaCidades_v3&nome=${texto}`
    );
    return request.data.result;
  };

  const autoCompleteChangeHandler = async (text: string) => {
    let matches: any = [];
    if (text.length > 2) {
      matches = await getCidades(text);
    }
    setSuggestions({ hasFetched: true, values: matches });
    setText(text);
  };

  const onSuggestionClick = ({ Nome, Codigo }: any): void => {
    setText(Nome);
    setSuggestions({ ...suggestions, values: [] });
    setForm({
      ...form,
      values: { ...form.values, localizacao: Nome, cod: Codigo },
    });
  };

  const createSuggestions = () => {
    return (
      <ul>
        {suggestions.values.map((suggestion: any, i) => (
          <li
            style={{ backgroundColor: "white" }}
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion.Nome}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div className={`${fieldsStyle.fieldsWrapper}`}>
        <input
          className={fieldsStyle.firstField}
          name="estabelecimento"
          placeholder={t("estabelecimento")}
          type="text"
          onInput={handleInput}
        />
        {/* <input
        id="rightField"
        placeholder={t("localizacao")}
        name="localizacao"
        type="text"
        onInput={handleInput}
      /> */}
        <div style={{ position: "relative" }}>
          <input
            placeholder={t("localizacao")}
            type="text"
            value={text}
            onInput={(e: any) => autoCompleteChangeHandler(e.target.value)}
            onBlur={() => {
              if (text.length === 0)
                setForm({
                  ...form,
                  isValid: false,
                  values: { ...form.values, localizacao: "", cod: "" },
                });
            }}
          />
          {suggestions.values.length ? createSuggestions() : null}
        </div>

        <button
          type="submit"
          style={form.isValid ? ButtonEnabledStyle : ButtonDisabledStyle}
          className={fieldsStyle.searchButton}
          disabled={!form.isValid}
        >
          <i className="fa fa-search fa-search"></i>
          {isMobile ? ` ${t("buscar")}` : ""}
        </button>
      </div>
    </form>
  );
};

export default ServiceSearchFields;
