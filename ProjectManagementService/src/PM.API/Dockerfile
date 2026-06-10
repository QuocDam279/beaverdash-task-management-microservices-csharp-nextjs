FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5002

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["ProjectManagementService/src/PM.API/PM.API.csproj", "ProjectManagementService/src/PM.API/"]
COPY ["ProjectManagementService/src/PM.Infrastructure/PM.Infrastructure.csproj", "ProjectManagementService/src/PM.Infrastructure/"]
COPY ["ProjectManagementService/src/PM.Application/PM.Application.csproj", "ProjectManagementService/src/PM.Application/"]
COPY ["ProjectManagementService/src/PM.Domain/PM.Domain.csproj", "ProjectManagementService/src/PM.Domain/"]
COPY ["BuildingBlocks/EventBus.Messages/EventBus.Messages.csproj", "BuildingBlocks/EventBus.Messages/"]
RUN dotnet restore "ProjectManagementService/src/PM.API/PM.API.csproj"
COPY . .
WORKDIR "/src/ProjectManagementService/src/PM.API"
RUN dotnet build "PM.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PM.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PM.API.dll"]
