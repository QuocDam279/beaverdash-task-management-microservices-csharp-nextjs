using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardColumnIdToSubTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "board_column_id",
                table: "sub_tasks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_sub_tasks_board_column_id",
                table: "sub_tasks",
                column: "board_column_id");

            migrationBuilder.AddForeignKey(
                name: "FK_sub_tasks_board_columns_board_column_id",
                table: "sub_tasks",
                column: "board_column_id",
                principalTable: "board_columns",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_sub_tasks_board_columns_board_column_id",
                table: "sub_tasks");

            migrationBuilder.DropIndex(
                name: "IX_sub_tasks_board_column_id",
                table: "sub_tasks");

            migrationBuilder.DropColumn(
                name: "board_column_id",
                table: "sub_tasks");
        }
    }
}
