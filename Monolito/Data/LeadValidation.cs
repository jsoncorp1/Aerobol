using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Aerobol.Data;

public static class LeadValidation
{
    // Deben coincidir con src/config/config.js y formulario.html.
    private static readonly string[] Ciudades = ["Santa Cruz", "La Paz", "Cochabamba", "Sucre", "Tarija", "Oruro", "Potosí", "Beni", "Pando", "Fuera de Bolivia"];
    private static readonly string[] Carreras = ["Piloto Privado", "Piloto Comercial", "Tripulante de Cabina (TCP)", "Despachador de Vuelo", "Técnico en Mantenimiento Aeronáutico", "Aún no sé"];
    private static readonly string[] Fuentes = ["", "Facebook", "Instagram", "TikTok", "Recomendación de alguien", "Otro"];

    public static string? Validate(Dictionary<string, string> datos)
    {
        if (datos.Count > 32 || datos.Any(x => x.Key.Length > 80 || x.Value is null || x.Value.Length > 500))
            return "Datos demasiado extensos.";
        string V(string key) => datos.GetValueOrDefault(key, "").Trim();
        if (V("botcheck") != "") return "No se pudo enviar el formulario.";
        if (new[] { "nombre", "whatsapp", "ciudad", "carrera", "inicio", "edad", "bachiller", "horario_contacto" }.Any(key => V(key) == ""))
            return "Completa los campos obligatorios.";
        if (V("nombre").Split(' ', StringSplitOptions.RemoveEmptyEntries).Count(word => Regex.IsMatch(word, @"^[\p{L}'.-]{2,}$")) < 2)
            return "Escribe tu nombre y apellido.";
        if (!int.TryParse(V("edad"), out var age) || age is < 14 or > 70) return "Escribe una edad entera entre 14 y 70 años.";
        if (!ValidPhone(V("whatsapp"))) return "Revisa el número de WhatsApp.";
        if (V("privacidad") != "true") return "Debes aceptar la política de privacidad.";
        if (!new[] { "Mañana", "Tarde", "Noche" }.Contains(V("horario_contacto"))
            || !new[] { "Sí", "Este año", "No" }.Contains(V("bachiller"))
            || !new[] { "Lo antes posible", "Gestión 2027", "Solo estoy averiguando" }.Contains(V("inicio"))
            || V("titulo_profesional_tecnico") is not ("" or "true" or "false")
            || !Ciudades.Contains(V("ciudad"))
            || !Carreras.Contains(V("carrera"))
            || !Fuentes.Contains(V("como_nos_conocio")))
            return "Revisa las opciones seleccionadas.";
        if (V("correo") != "" && (!MailAddress.TryCreate(V("correo"), out var email) || email.Address != V("correo") || !V("correo").Contains('.')))
            return "Revisa el correo electrónico.";
        if (age < 18 && (V("tutor_nombre").Length < 3 || !Regex.IsMatch(V("tutor_celular"), @"^\+591 [67]\d{7}$")))
            return "Completa los datos del tutor.";
        return null;
    }

    public static bool ValidPhone(string value) => value.StartsWith("+591 ")
        ? Regex.IsMatch(value, @"^\+591 [67]\d{7}$")
        : Regex.IsMatch(value, @"^\+\d{1,3} \d{7,15}$");
}
