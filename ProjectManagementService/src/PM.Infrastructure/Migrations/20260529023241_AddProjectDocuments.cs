using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "project_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "varchar", nullable: false),
                    file_url = table.Column<string>(type: "varchar", nullable: false),
                    file_type = table.Column<string>(type: "varchar", nullable: true),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: true),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_project_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_project_documents_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_project_documents_users_uploaded_by_user_id",
                        column: x => x.uploaded_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_project_id",
                table: "project_documents",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_uploaded_by_user_id",
                table: "project_documents",
                column: "uploaded_by_user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "project_documents");
        }
    }
}
