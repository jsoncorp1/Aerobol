using Aerobol.Data;
using Xunit;

public class LeadValidationTests
{
    private static Dictionary<string, string> Valid() => new()
    {
        ["nombre"] = "Persona Prueba", ["whatsapp"] = "+591 70000001", ["ciudad"] = "La Paz",
        ["carrera"] = "Piloto Privado", ["inicio"] = "Gestión 2027", ["edad"] = "22",
        ["privacidad_version"] = LegalPolicy.Version,
        ["bachiller"] = "Sí", ["horario_contacto"] = "Tarde", ["privacidad"] = "true"
    };

    [Fact] public void AdultCanRegister() => Assert.Null(LeadValidation.Validate(Valid()));
    [Theory]
    [InlineData("edad", "18.5")]
    [InlineData("edad", "13")]
    [InlineData("edad", "71")]
    [InlineData("nombre", "Solo")]
    [InlineData("privacidad", "false")]
    [InlineData("privacidad_version", "")]
    [InlineData("privacidad_version", "version-antigua")]
    [InlineData("whatsapp", "+591 12345678")]
    [InlineData("whatsapp", "+591 700000011")]
    [InlineData("correo", "texto invalido")]
    [InlineData("botcheck", "sitio de un bot")]
    [InlineData("horario_contacto", "Cualquiera")]
    [InlineData("ciudad", "Marte")]
    [InlineData("grado_academico", "Otro valor")]
    [InlineData("carrera", "<script>alert(1)</script>")]
    [InlineData("como_nos_conocio", "=HYPERLINK(\"http://x\",\"y\")")]
    public void InvalidInputIsRejected(string key, string value)
    {
        var data = Valid(); data[key] = value;
        Assert.NotNull(LeadValidation.Validate(data));
    }
    [Theory]
    [InlineData("ciudad", "Fuera de Bolivia")]
    [InlineData("carrera", "Aún no sé")]
    [InlineData("carrera", "Tripulante de Cabina (TCP)")]
    [InlineData("como_nos_conocio", "")]
    [InlineData("como_nos_conocio", "Recomendación de alguien")]
    public void FormOptionsAreAccepted(string key, string value)
    {
        var data = Valid(); data[key] = value;
        Assert.Null(LeadValidation.Validate(data));
    }
    [Fact] public void MinorRequiresTutor()
    {
        var data = Valid(); data["edad"] = "16";
        Assert.NotNull(LeadValidation.Validate(data));
        data["tutor_nombre"] = "Tutor Prueba"; data["tutor_celular"] = "+591 70000002";
        Assert.Null(LeadValidation.Validate(data));
    }
    [Fact] public void CampaignFieldsAreAccepted()
    {
        var data = Valid(); data["utm_source"] = "instagram"; data["utm_campaign"] = "admision2027";
        Assert.Null(LeadValidation.Validate(data));
    }
    [Fact] public void NullFieldDoesNotCrash()
    {
        var data = Valid(); data["nombre"] = null!;
        Assert.NotNull(LeadValidation.Validate(data));
    }
    [Theory]
    [InlineData("")]
    [InlineData("TÍTULO UNIVERSITARIO")]
    [InlineData("LICENCIA AERONÁUTICA")]
    [InlineData("TÍTULO TECNICO MEDIO")]
    public void ShortFormIsAccepted(string grado)
    {
        var data = Valid();
        data.Remove("carrera"); data.Remove("edad");
        data["grado_academico"] = grado;
        Assert.Null(LeadValidation.Validate(data));
    }
}
