using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTaskAssignee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tasks_users_assignee_user_id",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "IX_tasks_assignee_user_id",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "assigned_at",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "assignee_user_id",
                table: "tasks");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "assigned_at",
                table: "tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "assignee_user_id",
                table: "tasks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tasks_assignee_user_id",
                table: "tasks",
                column: "assignee_user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_users_assignee_user_id",
                table: "tasks",
                column: "assignee_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
