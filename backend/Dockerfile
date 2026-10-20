# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY src/SportHub/SportHub.csproj ./SportHub/
RUN dotnet restore ./SportHub/SportHub.csproj

# Copy everything else and build
COPY src/SportHub/. ./SportHub/
WORKDIR /src/SportHub
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Expose port 8080 (App Runner default)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Run the application
ENTRYPOINT ["dotnet", "SportHub.dll"]
