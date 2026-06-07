using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardAndTaskIndexesAndTeamOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_tasks_board_column_id",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_board_columns_project_id",
                table: "board_columns");

            migrationBuilder.CreateIndex(
                name: "ix_tasks_board_column_id_sort_order",
                table: "tasks",
                columns: new[] { "board_column_id", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "ix_board_columns_project_id_position",
                table: "board_columns",
                columns: new[] { "project_id", "position" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_tasks_board_column_id_sort_order",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "ix_board_columns_project_id_position",
                table: "board_columns");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_board_column_id",
                table: "tasks",
                column: "board_column_id");

            migrationBuilder.CreateIndex(
                name: "IX_board_columns_project_id",
                table: "board_columns",
                column: "project_id");
        }
    }
}
