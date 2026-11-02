FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Monolito/Aerobol.csproj Monolito/
RUN dotnet restore Monolito/Aerobol.csproj
COPY . .
# Se restaura de nuevo con los .razor presentes: sin ellos el SDK omite blazor.web.js.
RUN dotnet publish Monolito/Aerobol.csproj -c Release -o /out /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app /keys && chown app:app /app /keys
WORKDIR /app
COPY --from=build --chown=app:app /out .
ENV ASPNETCORE_HTTP_PORTS=8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    Aerobol__RutaClaves=/keys \
    TZ=America/La_Paz
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=8s --start-period=40s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1:8080/health/ready || exit 1
ENTRYPOINT ["dotnet", "Aerobol.dll"]
