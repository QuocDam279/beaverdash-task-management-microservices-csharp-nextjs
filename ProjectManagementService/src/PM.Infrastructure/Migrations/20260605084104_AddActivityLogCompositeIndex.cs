using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityLogCompositeIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_activity_log_project_id",
                table: "activity_log");

            migrationBuilder.CreateIndex(
                name: "ix_activity_log_project_id_created_at",
                table: "activity_log",
                columns: new[] { "project_id", "created_at" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_activity_log_project_id_created_at",
                table: "activity_log");

            migrationBuilder.CreateIndex(
                name: "IX_activity_log_project_id",
                table: "activity_log",
                column: "project_id");
        }
    }
}
