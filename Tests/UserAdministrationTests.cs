using Aerobol.Data;
using Xunit;

public class UserAdministrationTests
{
    [Theory]
    [InlineData("Administrador", true)]
    [InlineData("Vendedor", true)]
    [InlineData("SuperAdmin", false)]
    [InlineData("Admisiones", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void OnlyKnownRolesAreAllowed(string? role, bool expected) => Assert.Equal(expected, UserAdministration.AllowedRole(role));
    [Theory]
    [InlineData("Administrador", null, 1, true)]
    [InlineData("Administrador", "Vendedor", 1, true)]
    [InlineData("Administrador", "Administrador", 1, false)]
    [InlineData("Administrador", null, 2, false)]
    [InlineData("Vendedor", null, 1, false)]
    public void PreserveLastAdministrator(string current, string? next, int count, bool expected)
        => Assert.Equal(expected, UserAdministration.MustKeepAdministrator(current, next, count));
}
