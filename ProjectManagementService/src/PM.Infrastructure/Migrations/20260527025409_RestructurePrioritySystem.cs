using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RestructurePrioritySystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "priority",
                table: "sub_tasks",
                type: "varchar",
                nullable: true);

            // Migrate existing tasks priorities
            migrationBuilder.Sql("UPDATE tasks SET priority = 'Required' WHERE priority IN ('Critical', 'High')");
            migrationBuilder.Sql("UPDATE tasks SET priority = 'Important' WHERE priority = 'Medium'");
            migrationBuilder.Sql("UPDATE tasks SET priority = 'Extended' WHERE priority = 'Low'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse tasks priorities migration
            migrationBuilder.Sql("UPDATE tasks SET priority = 'High' WHERE priority = 'Required'");
            migrationBuilder.Sql("UPDATE tasks SET priority = 'Medium' WHERE priority = 'Important'");
            migrationBuilder.Sql("UPDATE tasks SET priority = 'Low' WHERE priority = 'Extended'");

            migrationBuilder.DropColumn(
                name: "priority",
                table: "sub_tasks");
        }
    }
}
