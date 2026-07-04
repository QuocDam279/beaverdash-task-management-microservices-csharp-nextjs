using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDeletedByUserIdToTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "deleted_by_user_id",
                table: "tasks",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "deleted_by_user_id",
                table: "tasks");
        }
    }
}
